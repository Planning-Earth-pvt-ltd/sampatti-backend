import { Router } from 'express';
import { AdminAnalyticsController } from '../controller/dashboard.controller';

const router = Router();


router.get('/admin/analytics/monthly-sales', AdminAnalyticsController.getMonthlySales);
router.get('/admin/analytics/revenue', AdminAnalyticsController.getRevenueAnalytics);
router.get('/admin/analytics/users', AdminAnalyticsController.getUserAnalytics);
router.get('/admin/analytics/dashboard', AdminAnalyticsController.getDashboardData);

export default router;