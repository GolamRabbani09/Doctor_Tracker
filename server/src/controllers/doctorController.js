const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { ApiError } = require('../middleware/errorHandler');

/**
 * @desc    Get all doctors with filtering, search, pagination, and sorting
 * @route   GET /api/doctors
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @param   {import('express').NextFunction} next
 */
const getDoctors = async (req, res, next) => {
  try {
    const {
      search,
      specialization,
      hospital,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Search functionality (name, specialization, hospital)
    if (search && search.trim() !== '') {
      const sanitizedSearch = search.trim();
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { specialization: { $regex: sanitizedSearch, $options: 'i' } },
        { hospital: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }

    // Filter by exact or regex specialization
    if (specialization && specialization.trim() !== '') {
      query.specialization = { $regex: new RegExp(`^${specialization.trim()}$`, 'i') };
    }

    // Filter by hospital
    if (hospital && hospital.trim() !== '') {
      query.hospital = { $regex: new RegExp(`^${hospital.trim()}$`, 'i') };
    }

    // Date range filter on createdAt
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          query.createdAt.$gte = start;
        }
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          // If date has no time component (midnight), set to end of that day
          if (end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0) {
            end.setHours(23, 59, 59, 999);
          }
          query.createdAt.$lte = end;
        }
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const allowedSortFields = ['name', 'specialization', 'hospital', 'createdAt', 'email'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    const [doctors, total] = await Promise.all([
      Doctor.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Doctor.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      success: true,
      data: {
        doctors,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @param   {import('express').NextFunction} next
 */
const getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('patients');

    if (!doctor) {
      return next(new ApiError(`Doctor not found with id of ${req.params.id}`, 404));
    }

    return res.status(200).json({
      success: true,
      data: {
        doctor
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new doctor
 * @route   POST /api/doctors
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @param   {import('express').NextFunction} next
 */
const createDoctor = async (req, res, next) => {
  try {
    const { name, specialization, hospital, phone, email } = req.body;

    const doctor = await Doctor.create({
      name,
      specialization,
      hospital,
      phone,
      email
    });

    return res.status(201).json({
      success: true,
      data: {
        doctor
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update doctor by ID
 * @route   PUT /api/doctors/:id
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @param   {import('express').NextFunction} next
 */
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!doctor) {
      return next(new ApiError(`Doctor not found with id of ${req.params.id}`, 404));
    }

    return res.status(200).json({
      success: true,
      data: {
        doctor
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete doctor by ID (cascades to delete assigned patients)
 * @route   DELETE /api/doctors/:id
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @param   {import('express').NextFunction} next
 */
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return next(new ApiError(`Doctor not found with id of ${req.params.id}`, 404));
    }

    // Cascade delete associated patients
    await Patient.deleteMany({ doctorId: doctor._id });

    // Delete the doctor record
    await doctor.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Doctor and all associated patients deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all patients assigned to a specific doctor
 * @route   GET /api/doctors/:id/patients
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @param   {import('express').NextFunction} next
 */
const getDoctorPatients = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return next(new ApiError(`Doctor not found with id of ${req.params.id}`, 404));
    }

    const patients = await Patient.find({ doctorId: req.params.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        patients
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients
};
