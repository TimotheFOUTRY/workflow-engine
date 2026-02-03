import React, { useState } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';

export default function TaskActions({ task, onComplete, disabled }) {
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);

  const handleAction = (action) => {
    if (showComment && comment.trim()) {
      onComplete(action, { comment });
      setComment('');
      setShowComment(false);
    } else {
      onComplete(action, {});
    }
  };

  const isApprovalTask = task.type === 'approval';

  return (
    <div className="bg-white shadow-sm rounded-lg border p-6 sticky top-6">
      <h3 className="text-lg font-semibold mb-4">Actions</h3>

      <div className="space-y-3">
        {isApprovalTask ? (
          <>
            <button
              onClick={() => handleAction('approve')}
              disabled={disabled}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircleIcon className="h-5 w-5" />
              Approve
            </button>
            <button
              onClick={() => handleAction('reject')}
              disabled={disabled}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              <XCircleIcon className="h-5 w-5" />
              Reject
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleAction('complete')}
              disabled={disabled}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircleIcon className="h-5 w-5" />
              Complete Task
            </button>
          </>
        )}

        {task.status === 'pending' && (
          <button
            onClick={() => handleAction('start')}
            disabled={disabled}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Start Task
          </button>
        )}

        <button
          onClick={() => setShowComment(!showComment)}
          className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center justify-center gap-2 transition-colors"
        >
          <ChatBubbleLeftIcon className="h-5 w-5" />
          {showComment ? 'Hide Comment' : 'Add Comment'}
        </button>
      </div>

      {showComment && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Add a comment about this action..."
          />
        </div>
      )}

      {disabled && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            This task is {task.status} and cannot be modified.
          </p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Task History</h4>
        {task.history && task.history.length > 0 ? (
          <div className="space-y-2">
            {task.history.slice(-3).reverse().map((entry, idx) => (
              <div key={idx} className="text-xs text-gray-600">
                <p className="font-medium">{entry.action}</p>
                <p className="text-gray-500">
                  {entry.user} - {new Date(entry.timestamp).toLocaleString()}
                </p>
                {entry.comment && (
                  <p className="mt-1 italic">"{entry.comment}"</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No history available</p>
        )}
      </div>
    </div>
  );
}
