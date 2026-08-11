export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export const getBadgeColorClass = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'CONFIRMED':
    case 'IN':
      return 'badge-success';
    case 'LEAD':
    case 'DRAFT':
      return 'badge-warning';
    case 'INACTIVE':
    case 'CANCELLED':
    case 'OUT':
      return 'badge-danger';
    case 'WHOLESALE':
    case 'DISTRIBUTOR':
      return 'badge-info';
    case 'RETAIL':
      return 'badge-secondary';
    case 'LOW STOCK':
      return 'badge-critical';
    default:
      return 'badge-neutral';
  }
};
