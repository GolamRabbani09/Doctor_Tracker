const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

/**
 * @desc    Get aggregate analytics dashboard statistics using a single MongoDB aggregation pipeline with $facet
 * @route   GET /api/analytics/dashboard
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @param   {import('express').NextFunction} next
 */
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Twelve months ago (first day of the month 11 months ago)
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Single unified database aggregation call using $unionWith and $facet
    const facetResults = await Doctor.aggregate([
      // Tag doctors with collection discriminator
      {
        $project: {
          _id: 1,
          name: 1,
          specialization: 1,
          hospital: 1,
          createdAt: 1,
          __collection: { $literal: 'doctor' }
        }
      },
      // Union with patients collection
      {
        $unionWith: {
          coll: 'patients',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                doctorId: 1,
                createdAt: 1,
                __collection: { $literal: 'patient' }
              }
            }
          ]
        }
      },
      // Multi-faceted aggregation pipeline
      {
        $facet: {
          // Total doctor count
          totalDoctors: [
            { $match: { __collection: 'doctor' } },
            { $count: 'count' }
          ],
          // Total patient count
          totalPatients: [
            { $match: { __collection: 'patient' } },
            { $count: 'count' }
          ],
          // Doctors created in last 30 days
          recentDoctors: [
            {
              $match: {
                __collection: 'doctor',
                createdAt: { $gte: thirtyDaysAgo }
              }
            },
            { $count: 'count' }
          ],
          // Patients created in last 30 days
          recentPatients: [
            {
              $match: {
                __collection: 'patient',
                createdAt: { $gte: thirtyDaysAgo }
              }
            },
            { $count: 'count' }
          ],
          // Specialization breakdown
          specializations: [
            { $match: { __collection: 'doctor' } },
            {
              $group: {
                _id: '$specialization',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1, _id: 1 } }
          ],
          // Hospital distribution breakdown
          hospitalDistribution: [
            { $match: { __collection: 'doctor' } },
            {
              $group: {
                _id: '$hospital',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1, _id: 1 } }
          ],
          // Top 10 doctors by assigned patient count
          doctorPatientDistribution: [
            { $match: { __collection: 'doctor' } },
            {
              $lookup: {
                from: 'patients',
                localField: '_id',
                foreignField: 'doctorId',
                as: 'assignedPatients'
              }
            },
            {
              $project: {
                _id: 1,
                doctorName: '$name',
                patientCount: { $size: '$assignedPatients' }
              }
            },
            { $sort: { patientCount: -1, doctorName: 1 } },
            { $limit: 10 }
          ],
          // Doctor registration trends over last 12 months
          doctorTrends: [
            {
              $match: {
                __collection: 'doctor',
                createdAt: { $gte: twelveMonthsAgo }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
              }
            }
          ],
          // Patient registration trends over last 12 months
          patientTrends: [
            {
              $match: {
                __collection: 'patient',
                createdAt: { $gte: twelveMonthsAgo }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const result = facetResults[0] || {};

    const totalDoctors = result.totalDoctors?.[0]?.count || 0;
    const totalPatients = result.totalPatients?.[0]?.count || 0;
    const recentDoctors = result.recentDoctors?.[0]?.count || 0;
    const recentPatients = result.recentPatients?.[0]?.count || 0;

    const avgPatientsPerDoctor =
      totalDoctors > 0 ? parseFloat((totalPatients / totalDoctors).toFixed(2)) : 0;

    const specializations = result.specializations || [];
    const hospitalDistribution = result.hospitalDistribution || [];
    const doctorPatientDistribution = (result.doctorPatientDistribution || []).map((d) => ({
      doctorName: d.doctorName,
      patientCount: d.patientCount
    }));

    // Merge doctor and patient trends into chronological 12-month array
    const trendsMap = new Map();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const key = `${year}-${month}`;
      trendsMap.set(key, {
        _id: { year, month },
        doctors: 0,
        patients: 0
      });
    }

    (result.doctorTrends || []).forEach((item) => {
      if (item._id && item._id.year && item._id.month) {
        const key = `${item._id.year}-${item._id.month}`;
        if (trendsMap.has(key)) {
          trendsMap.get(key).doctors = item.count;
        } else {
          trendsMap.set(key, { _id: item._id, doctors: item.count, patients: 0 });
        }
      }
    });

    (result.patientTrends || []).forEach((item) => {
      if (item._id && item._id.year && item._id.month) {
        const key = `${item._id.year}-${item._id.month}`;
        if (trendsMap.has(key)) {
          trendsMap.get(key).patients = item.count;
        } else {
          trendsMap.set(key, { _id: item._id, doctors: 0, patients: item.count });
        }
      }
    });

    const registrationTrends = Array.from(trendsMap.values());

    return res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        avgPatientsPerDoctor,
        recentDoctors,
        recentPatients,
        specializations,
        hospitalDistribution,
        doctorPatientDistribution,
        registrationTrends
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics
};
