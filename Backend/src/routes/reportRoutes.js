const express = require('express');
const router = express.Router();
const {
  getOverview,
  getGstSummary,
  getProductWiseReport,
  getClientWiseReport,
  getYearlyTrends,
} = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authFirebase');


// All report routes are protected
router.use(authMiddleware);

router.get('/overview', getOverview);
router.get('/gst-summary', getGstSummary);
router.get('/product-wise', getProductWiseReport);
router.get('/client-wise', getClientWiseReport);
router.get('/yearly-trends', getYearlyTrends);

module.exports = router;
