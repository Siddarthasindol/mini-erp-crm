import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string, followUpDate?: string) => Promise<void>;
  customerName: string;
  isLoading?: boolean;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customerName,
  isLoading = false,
}) => {
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    await onSubmit(note, followUpDate || undefined);
    setNote('');
    setFollowUpDate('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add CRM Follow-up Note: ${customerName}`}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Follow-up Details & Note *</label>
          <textarea
            className="form-control"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
            placeholder="Record client discussion, price quotation feedback, or next steps..."
          />
        </div>

        <Input
          label="Next Scheduled Follow-up Date"
          type="date"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
        />

        <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Save Follow-up Log
          </Button>
        </div>
      </form>
    </Modal>
  );
};
