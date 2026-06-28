'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePollar } from '@pollar/react';
import type { Campaign } from '../../../types';
import CampaignCard from '../../../components/CampaignCard';
import MilestoneList from '../../../components/MilestoneList';
import BackCampaign from '../../../components/BackCampaign';
import { useCampaign } from '../../../hooks/useCampaign';

const STORAGE_KEY = 'pollar_campaigns';

function loadCampaigns(): Campaign[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function CampaignDetailPage({ params }: { params: Promise<{ address: string }> }) {
  const [address, setAddress] = useState<string>('');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const { isConnected, address: walletAddress, signer } = usePollar();
  const { approveMilestone, releaseMilestone, disputeMilestone, loading } = useCampaign();

  useEffect(() => {
    params.then((p) => setAddress(p.address));
  }, [params]);

  useEffect(() => {
    if (!address) return;
    const campaigns = loadCampaigns();
    const found = campaigns.find((c) => c.escrowAddress === address);
    setCampaign(found || null);
  }, [address]);

  const refreshCampaign = useCallback(() => {
    if (!address) return;
    const campaigns = loadCampaigns();
    const found = campaigns.find((c) => c.escrowAddress === address);
    setCampaign(found || null);
  }, [address]);

  const isApprover = isConnected && campaign && walletAddress?.toLowerCase() === campaign.approver.toLowerCase();

  const handleApprove = async (milestoneId: string) => {
    if (!signer || !campaign) return;
    await approveMilestone(campaign.escrowAddress, milestoneId, signer);
    // Update local state
    if (campaign) {
      const updated = {
        ...campaign,
        milestones: campaign.milestones.map((m) =>
          m.id === milestoneId ? { ...m, status: 'approved' as const } : m
        ),
      };
      setCampaign(updated);
      // Persist
      const campaigns = loadCampaigns().map((c) =>
        c.id === updated.id ? updated : c
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    }
  };

  const handleRelease = async (milestoneId: string) => {
    if (!signer || !campaign) return;
    await releaseMilestone(campaign.escrowAddress, milestoneId, signer);
    if (campaign) {
      const updated = {
        ...campaign,
        milestones: campaign.milestones.map((m) =>
          m.id === milestoneId ? { ...m, status: 'released' as const } : m
        ),
      };
      setCampaign(updated);
      const campaigns = loadCampaigns().map((c) =>
        c.id === updated.id ? updated : c
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    }
  };

  const handleDispute = async (milestoneId: string, reason: string) => {
    if (!signer || !campaign) return;
    await disputeMilestone(campaign.escrowAddress, milestoneId, reason, signer);
    if (campaign) {
      const updated = {
        ...campaign,
        status: 'disputed' as const,
        milestones: campaign.milestones.map((m) =>
          m.id === milestoneId ? { ...m, status: 'disputed' as const } : m
        ),
      };
      setCampaign(updated);
      const campaigns = loadCampaigns().map((c) =>
        c.id === updated.id ? updated : c
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    }
  };

  if (!campaign) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign not found</h2>
        <p className="text-gray-600">No campaign found with address {address}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <CampaignCard campaign={campaign} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <MilestoneList
            milestones={campaign.milestones}
            isApprover={!!isApprover}
            onApprove={handleApprove}
            onRelease={handleRelease}
            onDispute={handleDispute}
            loading={loading}
          />
        </div>

        <div className="space-y-6">
          <BackCampaign campaign={campaign} />

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Campaign Info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd className="text-gray-900 font-medium capitalize">{campaign.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Backers</dt>
                <dd className="text-gray-900">{campaign.backers.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Creator</dt>
                <dd className="text-gray-900 font-mono text-xs">
                  {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Approver</dt>
                <dd className="text-gray-900 font-mono text-xs">
                  {campaign.approver.slice(0, 6)}...{campaign.approver.slice(-4)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Escrow</dt>
                <dd className="text-gray-900 font-mono text-xs">
                  {campaign.escrowAddress.slice(0, 6)}...{campaign.escrowAddress.slice(-4)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}