'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteSAMLButtonProps {
  envId: string;
  envName: string;
}

export default function DeleteSAMLButton({ envId, envName }: DeleteSAMLButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/saml/environments/${envId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/saml');
        router.refresh();
      } else {
        const error = await response.json();
        alert(`Failed to delete: ${error.error || 'Unknown error'}`);
        setIsDeleting(false);
        setShowConfirm(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete environment. Please try again.');
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#0a0a0f] border border-red-500/30 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
          <div className="text-4xl mb-4 text-center">⚠️</div>
          <h3 className="text-xl font-bold mb-2 text-center">Delete SAML Environment?</h3>
          <p className="text-gray-400 mb-6 text-center">
            Are you sure you want to delete <strong className="text-white">{envName}</strong>?
            This will also delete all associated sessions and cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition text-sm font-medium text-red-400"
    >
      🗑️ Delete
    </button>
  );
}
