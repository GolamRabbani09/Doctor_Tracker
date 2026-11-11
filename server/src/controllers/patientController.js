const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { ApiError } = require('../middleware/errorHandler');

/**
 * @desc    Get all patients with filtering, search, pagination, and sorting
 * @route   GET /api/patients
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @param   {import('express').NextFunction} next
 */
const getPatients = async (req, res, next) => {
  try {
    const {
      search,
      condition,
      doctorId,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Search functionality (name, condition)
    if (search && search.trim() !== '') {
      const sanitizedSearch = search.trim();
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { condition: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }

    // Filter by condition
    if (condition && condition.trim() !== '') {
      query.condition = { $regex: new RegExp(`^${condition.trim()}$`, 'i') };
    }

    // Filter by assigned doctor
    if (doctorId && doctorId.trim() !== '') {
      query.doctorId = doctorId.trim();
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
    const allowedSortFields = ['name', 'age', 'condition', 'createdAt', 'gender'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .populate('doctorId', 'name specialization hospital email phone')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Patient.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      success: true,
      data: {
        patients,
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
 * @desc    Get single patient by ID
 * @route   GET /api/patients/:id
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @param   {import('express').NextFunction} next
 */
const getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      'doctorId',
      'name specialization hospital email phone'
    );

    if (!patient) {
      return next(new ApiError(`Patient not found with id of ${req.params.id}`, 404));
    }

    return res.status(200).json({
      success: true,
      data: {
        patient
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new patient
 * @route   POST /api/patients
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @param   {import('express').NextFunction} next
 */
const createPatient = async (req, res, next) => {
  try {
    const { name, age, gender, phone, email, condition, doctorId } = req.body;

    // Validate that the assigned doctor exists
    if (!doctorId) {
      return next(new ApiError('doctorId is required to create a patient', 400));
    }

    const doctorExists = await Doctor.findById(doctorId);
    if (!doctorExists) {
      return next(new ApiError(`Assigned doctor not found with id of ${doctorId}`, 404));
    }

    let patient = await Patient.create({
      name,
      age,
      gender,
      phone,
      email,
      condition,
      doctorId
    });

    // Populate doctor details before responding
    patient = await patient.populate('doctorId', 'name specialization hospital email phone');

    return res.status(201).json({
      success: true,
      data: {
        patient
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update patient by ID
 * @route   PUT /api/patients/:id
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @param   {import('express').NextFunction} next
 */
const updatePatient = async (req, res, next) => {
  try {
    // If updating doctorId, verify new doctor exists
    if (req.body.doctorId) {
      const doctorExists = await Doctor.findById(req.body.doctorId);
      if (!doctorExists) {
        return next(new ApiError(`Assigned doctor not found with id of ${req.body.doctorId}`, 404));
      }
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('doctorId', 'name specialization hospital email phone');

    if (!patient) {
      return next(new ApiError(`Patient not found with id of ${req.params.id}`, 404));
    }

    return res.status(200).json({
      success: true,
      data: {
        patient
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete patient by ID
 * @route   DELETE /api/patients/:id
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @param   {import('express').NextFunction} next
 */
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return next(new ApiError(`Patient not found with id of ${req.params.id}`, 404));
    }

    await patient.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient
};
