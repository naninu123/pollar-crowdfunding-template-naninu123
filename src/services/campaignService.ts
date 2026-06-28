import { useEscrow } from '@pollar/react';
import type { Campaign, Milestone } from '../types';

export interface CreateCampaignParams {
  engagementId: string;
  title: string;
  description: string;
  approver: string;
  creator: string;
  platformAddress: string;
  amount: number;
  platformFee: number;
  signer: any;
}

export interface CampaignResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export const campaignService = {
  async createCampaign(params: CreateCampaignParams): Promise<CampaignResult<string>> {
    try {
      const { deployEscrow } = useEscrow();
      const escrowAddress = await deployEscrow(
        params.engagementId,
        params.title,
        params.description,
        params.approver,
        params.creator,
        params.platformAddress,
        params.amount,
        params.platformFee,
        params.signer
      );
      return { success: true, data: escrowAddress };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create campaign' };
    }
  },

  async backCampaign(escrowAddress: string, amount: number, signer: any): Promise<CampaignResult<void>> {
    try {
      const { fund } = useEscrow();
      await fund(escrowAddress, amount, signer);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to back campaign' };
    }
  },

  async approveMilestone(escrowAddress: string, milestoneId: string, signer: any): Promise<CampaignResult<void>> {
    try {
      const { approveMilestone: approve } = useEscrow();
      await approve(escrowAddress, milestoneId, signer);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to approve milestone' };
    }
  },

  async releaseMilestone(escrowAddress: string, milestoneId: string, signer: any): Promise<CampaignResult<void>> {
    try {
      const { releaseMilestone: release } = useEscrow();
      await release(escrowAddress, milestoneId, signer);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to release milestone' };
    }
  },

  async disputeMilestone(
    escrowAddress: string,
    milestoneId: string,
    reason: string,
    signer: any
  ): Promise<CampaignResult<void>> {
    try {
      const { disputeMilestone: dispute } = useEscrow();
      await dispute(escrowAddress, milestoneId, reason, signer);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to dispute milestone' };
    }
  },
};