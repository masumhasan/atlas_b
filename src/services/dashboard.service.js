const { Page } = require('../models/page.model');
const { Insight } = require('../models/insight.model');
const { RecentChange } = require('../models/change.model');

const formatTimeAgo = (date) => {
  const diffSec = Math.floor((new Date() - new Date(date)) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  if (diffSec < 172800) return 'Yesterday';
  return `${Math.floor(diffSec / 86400)} days ago`;
};

const getDashboardStats = async () => {
  const [publishedPages, draftPages, hiddenPages, publishedInsights, draftInsights, recentChanges] =
    await Promise.all([
      Page.countDocuments({ visibility: 'published' }),
      Page.countDocuments({ visibility: 'draft' }),
      Page.countDocuments({ visibility: 'hidden' }),
      Insight.countDocuments({ status: 'published' }),
      Insight.countDocuments({ status: 'draft' }),
      RecentChange.find().sort({ createdAt: -1 }).limit(15),
    ]);

  const stats = [
    {
      id: 'published-pages',
      label: 'Published Pages',
      value: publishedPages,
      delta: '+8.2%',
      trend: 'up',
      detail: 'Live on public website',
    },
    {
      id: 'draft-pages',
      label: 'Draft Pages',
      value: draftPages,
      delta: '0',
      trend: 'flat',
      detail: 'In preparation',
    },
    {
      id: 'hidden-pages',
      label: 'Hidden Pages',
      value: hiddenPages,
      delta: '-1',
      trend: hiddenPages > 0 ? 'down' : 'flat',
      detail: 'Hidden from public navigation',
    },
    {
      id: 'published-insights',
      label: 'Published Insights',
      value: publishedInsights,
      delta: '+12.5%',
      trend: 'up',
      detail: 'Executive insights active',
    },
    {
      id: 'draft-insights',
      label: 'Draft Insights',
      value: draftInsights,
      delta: '0',
      trend: 'flat',
      detail: 'Pending editorial review',
    },
  ];

  const formattedChanges = recentChanges.map((change) => ({
    id: change._id.toString(),
    title: change.title,
    type: change.type,
    status: change.status,
    action: change.action,
    updatedAt: formatTimeAgo(change.createdAt),
    updatedBy: change.updatedBy,
    summary: change.summary,
  }));

  return {
    stats,
    recentChanges: {
      data: formattedChanges,
    },
  };
};

module.exports = {
  getDashboardStats,
};
