import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to get start of month
const startOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

// Helper function to get end of month
const endOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

// Helper function to subtract months
const subMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
};

// Helper function to format date
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

interface MonthlySalesData {
  currentMonth: {
    sales: number;
    revenue: number;
    transactions: number;
  };
  previousMonth: {
    sales: number;
    revenue: number;
    transactions: number;
  };
  thirdMonth: {
    sales: number;
    revenue: number;
    transactions: number;
  };
}

interface RevenueAnalytics {
  totalRevenue: number;
  monthlyGrowth: number;
  averageOrderValue: number;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    growth: number;
  }>;
}

interface UserAnalytics {
  totalUsers: number;
  newUsers: {
    count: number;
    percentage: number;
  };
  returningUsers: {
    count: number;
    percentage: number;
  };
  userGrowthData: Array<{
    month: string;
    newUsers: number;
    returningUsers: number;
  }>;
}

interface MonthlyRevenueData {
  month: string;
  revenue: number;
  transactions: number;
}

export class AdminAnalyticsController {
  
  // Get monthly sales data for current, previous, and third month
  static async getMonthlySales(req: Request, res: Response): Promise<void> {
    try {
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      
      const previousMonthStart = startOfMonth(subMonths(now, 1));
      const previousMonthEnd = endOfMonth(subMonths(now, 1));
      
      const thirdMonthStart = startOfMonth(subMonths(now, 2));
      const thirdMonthEnd = endOfMonth(subMonths(now, 2));

      // Current month data - ALL transactions
      const currentMonthData = await prisma.transaction.aggregate({
        where: {
          createdAt: {
            gte: currentMonthStart,
            lte: currentMonthEnd,
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      });

      // Previous month data - ALL transactions
      const previousMonthData = await prisma.transaction.aggregate({
        where: {
          createdAt: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      });

      // Third month data - ALL transactions
      const thirdMonthData = await prisma.transaction.aggregate({
        where: {
          createdAt: {
            gte: thirdMonthStart,
            lte: thirdMonthEnd,
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      });

      // Count properties sold each month
      const currentMonthProperties = await prisma.property.count({
        where: {
          createdAt: {
            gte: currentMonthStart,
            lte: currentMonthEnd,
          },
          status: 'Sold',
        },
      });

      const previousMonthProperties = await prisma.property.count({
        where: {
          createdAt: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
          status: 'Sold',
        },
      });

      const thirdMonthProperties = await prisma.property.count({
        where: {
          createdAt: {
            gte: thirdMonthStart,
            lte: thirdMonthEnd,
          },
          status: 'Sold',
        },
      });

      const salesData: MonthlySalesData = {
        currentMonth: {
          sales: currentMonthProperties,
          revenue: Number(currentMonthData._sum.amount ?? 0),
          transactions: currentMonthData._count ?? 0,
        },
        previousMonth: {
          sales: previousMonthProperties,
          revenue: Number(previousMonthData._sum.amount ?? 0),
          transactions: previousMonthData._count ?? 0,
        },
        thirdMonth: {
          sales: thirdMonthProperties,
          revenue: Number(thirdMonthData._sum.amount ?? 0),
          transactions: thirdMonthData._count ?? 0,
        },
      };

      res.status(200).json({
        success: true,
        data: salesData,
        message: 'Monthly sales data retrieved successfully'
      });

    } catch (error) {
      console.error('Error fetching monthly sales:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get dynamic revenue analytics
  static async getRevenueAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const now = new Date();
      const months: MonthlyRevenueData[] = [];
      
      // Generate last 6 months data - ALL transactions
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const monthRevenue = await prisma.transaction.aggregate({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            amount: true,
          },
          _count: true,
        });

        months.push({
          month: formatDate(monthDate),
          revenue: Number(monthRevenue._sum.amount ?? 0),
          transactions: monthRevenue._count ?? 0,
        });
      }

      // Calculate growth rates
      const revenueByMonth = months.map((month, index) => {
        let growth = 0;
        if (index > 0) {
          const prevRevenue = months[index - 1].revenue;
          if (prevRevenue > 0) {
            growth = ((month.revenue - prevRevenue) / prevRevenue) * 100;
          }
        }
        return {
          month: month.month,
          revenue: month.revenue,
          growth: Math.round(growth * 100) / 100,
        };
      });

      // Calculate total metrics - ALL transactions
      const totalRevenue = await prisma.transaction.aggregate({
        where: {},
        _sum: {
          amount: true,
        },
        _count: true,
      });

      const currentMonth = revenueByMonth[revenueByMonth.length - 1];
      const previousMonth = revenueByMonth[revenueByMonth.length - 2];
      
      const monthlyGrowth = currentMonth && previousMonth 
        ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
        : 0;

      const averageOrderValue = (totalRevenue._count ?? 0) > 0 
        ? Number(totalRevenue._sum.amount ?? 0) / (totalRevenue._count ?? 0)
        : 0;

      const analytics: RevenueAnalytics = {
        totalRevenue: Number(totalRevenue._sum.amount ?? 0),
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        revenueByMonth,
      };

      res.status(200).json({
        success: true,
        data: analytics,
        message: 'Revenue analytics retrieved successfully'
      });

    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get user analytics with new vs returning users progress
  static async getUserAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const now = new Date();

      // Total users count
      const totalUsers = await prisma.user.count();

      // New users (registered in last 30 days)
      const thirtyDaysAgo = subMonths(now, 1);
      const newUsersCount = await prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      });

      // Users who made ANY transactions (returning/active users)
      const activeUsers = await prisma.user.count({
        where: {
          Transaction: {
            some: {
              createdAt: {
                gte: thirtyDaysAgo,
              },
            },
          },
        },
      });

      // Calculate percentages
      const newUserPercentage = totalUsers > 0 ? (newUsersCount / totalUsers) * 100 : 0;
      const returningUserPercentage = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

      // Monthly user growth data
      const userGrowthData = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const monthNewUsers = await prisma.user.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        const monthActiveUsers = await prisma.user.count({
          where: {
            Transaction: {
              some: {
                createdAt: {
                  gte: monthStart,
                  lte: monthEnd,
                },
              },
            },
          },
        });

        userGrowthData.push({
          month: formatDate(monthDate),
          newUsers: monthNewUsers,
          returningUsers: monthActiveUsers,
        });
      }

      const analytics: UserAnalytics = {
        totalUsers,
        newUsers: {
          count: newUsersCount,
          percentage: Math.round(newUserPercentage * 100) / 100,
        },
        returningUsers: {
          count: activeUsers,
          percentage: Math.round(returningUserPercentage * 100) / 100,
        },
        userGrowthData,
      };

      res.status(200).json({
        success: true,
        data: analytics,
        message: 'User analytics retrieved successfully'
      });

    } catch (error) {
      console.error('Error fetching user analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get comprehensive dashboard data
  static async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      // Get all analytics data in parallel
      const [salesData, revenueData, userData] = await Promise.all([
        AdminAnalyticsController.getMonthlySalesData(),
        AdminAnalyticsController.getRevenueAnalyticsData(),
        AdminAnalyticsController.getUserAnalyticsData(),
      ]);

      const dashboardData = {
        sales: salesData,
        revenue: revenueData,
        users: userData,
      };

      res.status(200).json({
        success: true,
        data: dashboardData,
        message: 'Dashboard data retrieved successfully'
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper methods for internal use
  private static async getMonthlySalesData(): Promise<MonthlySalesData> {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));
    
    const thirdMonthStart = startOfMonth(subMonths(now, 2));
    const thirdMonthEnd = endOfMonth(subMonths(now, 2));

    // Get transaction data for all three months - ALL transactions
    const [currentMonthData, previousMonthData, thirdMonthData] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: {
          createdAt: { gte: previousMonthStart, lte: previousMonthEnd },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: {
          createdAt: { gte: thirdMonthStart, lte: thirdMonthEnd },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    // Get property sales data for all three months
    const [currentSales, previousSales, thirdSales] = await Promise.all([
      prisma.property.count({
        where: {
          createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
          status: 'Sold',
        },
      }),
      prisma.property.count({
        where: {
          createdAt: { gte: previousMonthStart, lte: previousMonthEnd },
          status: 'Sold',
        },
      }),
      prisma.property.count({
        where: {
          createdAt: { gte: thirdMonthStart, lte: thirdMonthEnd },
          status: 'Sold',
        },
      }),
    ]);

    return {
      currentMonth: {
        sales: currentSales,
        revenue: Number(currentMonthData._sum.amount ?? 0),
        transactions: currentMonthData._count ?? 0,
      },
      previousMonth: {
        sales: previousSales,
        revenue: Number(previousMonthData._sum.amount ?? 0),
        transactions: previousMonthData._count ?? 0,
      },
      thirdMonth: {
        sales: thirdSales,
        revenue: Number(thirdMonthData._sum.amount ?? 0),
        transactions: thirdMonthData._count ?? 0,
      },
    };
  }

  private static async getRevenueAnalyticsData(): Promise<RevenueAnalytics> {
    const now = new Date();
    const months: MonthlyRevenueData[] = [];
    
    // Generate revenue data for last 6 months - ALL transactions
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthRevenue = await prisma.transaction.aggregate({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
        _count: true,
      });

      months.push({
        month: formatDate(monthDate),
        revenue: Number(monthRevenue._sum.amount ?? 0),
        transactions: monthRevenue._count ?? 0,
      });
    }

    // Calculate growth rates
    const revenueByMonth = months.map((month, index) => {
      let growth = 0;
      if (index > 0) {
        const prevRevenue = months[index - 1].revenue;
        if (prevRevenue > 0) {
          growth = ((month.revenue - prevRevenue) / prevRevenue) * 100;
        }
      }
      return { 
        month: month.month,
        revenue: month.revenue,
        growth: Math.round(growth * 100) / 100 
      };
    });

    // Get total revenue from ALL transactions
    const totalRevenue = await prisma.transaction.aggregate({
      where: {},
      _sum: { amount: true },
      _count: true,
    });

    const currentMonth = revenueByMonth[revenueByMonth.length - 1];
    const previousMonth = revenueByMonth[revenueByMonth.length - 2];
    
    const monthlyGrowth = currentMonth && previousMonth 
      ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
      : 0;

    const averageOrderValue = (totalRevenue._count ?? 0) > 0 
      ? Number(totalRevenue._sum.amount ?? 0) / (totalRevenue._count ?? 0)
      : 0;

    return {
      totalRevenue: Number(totalRevenue._sum.amount ?? 0),
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      revenueByMonth,
    };
  }

  private static async getUserAnalyticsData(): Promise<UserAnalytics> {
    const now = new Date();
    const thirtyDaysAgo = subMonths(now, 1);

    // Get user counts
    const totalUsers = await prisma.user.count();
    const newUsersCount = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    // Users who made ANY transactions
    const activeUsers = await prisma.user.count({
      where: {
        Transaction: {
          some: { createdAt: { gte: thirtyDaysAgo } },
        },
      },
    });

    // Calculate percentages
    const newUserPercentage = totalUsers > 0 ? (newUsersCount / totalUsers) * 100 : 0;
    const returningUserPercentage = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    // Generate user growth data for last 6 months
    const userGrowthData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const [monthNewUsers, monthActiveUsers] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: { gte: monthStart, lte: monthEnd },
          },
        }),
        prisma.user.count({
          where: {
            Transaction: {
              some: {
                createdAt: { gte: monthStart, lte: monthEnd },
              },
            },
          },
        }),
      ]);

      userGrowthData.push({
        month: formatDate(monthDate),
        newUsers: monthNewUsers,
        returningUsers: monthActiveUsers,
      });
    }

    return {
      totalUsers,
      newUsers: {
        count: newUsersCount,
        percentage: Math.round(newUserPercentage * 100) / 100,
      },
      returningUsers: {
        count: activeUsers,
        percentage: Math.round(returningUserPercentage * 100) / 100,
      },
      userGrowthData,
    };
  }
}