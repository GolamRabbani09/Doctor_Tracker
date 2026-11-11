const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes in this router
router.use(protect);

router
  .route('/')
  .get(getDoctors)
  .post(createDoctor);

router
  .route('/:id')
  .get(getDoctor)
  .put(updateDoctor)
  .delete(deleteDoctor);

router
  .route('/:id/patients')
  .get(getDoctorPatients);

module.exports = router;
