import React from 'react';
import { getBadgeColorClass } from '../../utils/formatters';

interface BadgeProps {
  status: string;
  label?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label }) => {
  const colorClass = getBadgeColorClass(status);
  return <span className={`badge ${colorClass}`}>{label || status}</span>;
};
