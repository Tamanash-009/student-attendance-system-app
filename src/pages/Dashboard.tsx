import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Users, UserCheck, UserX, BarChart3, Sparkles } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import type { AttendanceStats } from '../types';

export const Dashboard = () => {
  const [stats, setStats] = useState<AttendanceStats>({
    totalStudents: 0,
    presentCount: 0,
    absentCount: 0,
    attendancePercentage: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await attendanceService.getStats();
    setStats(data);
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Present (All Time)',
      value: stats.presentCount,
      icon: UserCheck,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Absent (All Time)',
      value: stats.absentCount,
      icon: UserX,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10'
    },
    {
      title: 'Avg. Attendance %',
      value: `${stats.attendancePercentage}%`,
      icon: BarChart3,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10'
    }
  ];

  // Algorithmic AI Insights generation based on purely local logic
  const generateInsights = () => {
    if (stats.totalStudents === 0) return ["Not enough data to generate insights yet."];
    
    const insights = [];
    if (stats.attendancePercentage < 75) {
      insights.push(`🚨 Warning: Overall attendance is dropping below the 75% threshold. Consider sending reminders.`);
    } else if (stats.attendancePercentage >= 95) {
      insights.push(`🌟 Excellent! The current class attendance rate remains exceptionally high.`);
    }

    if (stats.absentCount > stats.presentCount * 0.2) {
      insights.push(`📉 An unusually high frequency of absences detected recently.`);
    } else {
      insights.push(`📊 Attendance patterns seem stable over the analyzed period.`);
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Snapshot of your class attendance data.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* AI Insights Panel */}
      <Card className="mt-6 border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-indigo-700 dark:text-indigo-400">
            <Sparkles className="w-5 h-5 mr-2" />
            AI Attendance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-start">
                <span className="w-2 h-2 mt-2 mr-3 rounded-full bg-indigo-500 shrink-0" />
                <span className="text-sm leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
