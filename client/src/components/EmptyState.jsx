import React from 'react';
import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = Compass,
  title = 'No items found',
  description = 'Try adjusting your search filters or browse our other travel categories.',
  actionLabel,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 my-6 shadow-soft">
      <div className="p-4 bg-primary-50 rounded-full text-primary-600 mb-4 ring-8 ring-primary-50/50">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-md mb-6 text-sm leading-relaxed">{description}</p>
      {actionLabel && (actionLink ? (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-md transition-colors text-sm"
        >
          {actionLabel}
        </Link>
      ) : (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-md transition-colors text-sm"
        >
          {actionLabel}
        </button>
      ))}
    </div>
  );
};

export default EmptyState;
