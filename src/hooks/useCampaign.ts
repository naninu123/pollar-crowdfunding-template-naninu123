import { useState, useCallback } from 'react';
import type { Campaign } from '../types';
import { campaignService, type CreateCampaignParams } from '../services/campaignService';

interface UseCampaignState {
  campaign: Campaign | null;
  loading: boolean;
  error: string | null;
}

const initialState: UseCampaignState = {
  campaign: null,
  loading: false,
  error: null,
};

export function useCampaign() {
  const [state, setState] = useState<UseCampaignState>(initialState);

  const createCampaign = useCallback(async (params: CreateCampaignParams) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const result = await campaignService.createCampaign(params);
    if (result.success) {
      setState((prev) => ({
        ...prev,
        loading: false,
        campaign: {
          id: result.data!,
          title: params.title,
          description: params.description,
          goal: params.amount,
          creator: params.creator,
          approver: params.approver,
          platformAddress: params.platformAddress,
          escrowAddress: result.data!,
          milestones: [],
          status: 'draft',
          funded: 0,
          backers: [],
        },
      }));
    } else {
      setState((prev) => ({ ...prev, loading: false, error: result.error! }));
    }
    return result;
  }, []);

  const backCampaign = useCallback(async (escrowAddress: string, amount: number, signer: any) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const result = await campaignService.backCampaign(escrowAddress, amount, signer);
    if (result.success && state.campaign) {
      setState((prev) => ({
        ...prev,
        loading: false,
        campaign: prev.campaign
          ? { ...prev.campaign, funded: prev.campaign.funded + amount }
          : null,
      }));
    } else {
      setState((prev) => ({ ...prev, loading: false, error: result.error! }));
    }
    return result;
  }, [state.campaign]);

  const approveMilestone = useCallback(async (escrowAddress: string, milestoneId: string, signer: any) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const result = await campaignService.approveMilestone(escrowAddress, milestoneId, signer);
    if (!result.success) {
      setState((prev) => ({ ...prev, loading: false, error: result.error! }));
    } else {
      setState((prev) => ({ ...prev, loading: false }));
    }
    return result;
  }, []);

  const releaseMilestone = useCallback(async (escrowAddress: string, milestoneId: string, signer: any) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const result = await campaignService.releaseMilestone(escrowAddress, milestoneId, signer);
    if (!result.success) {
      setState((prev) => ({ ...prev, loading: false, error: result.error! }));
    } else {
      setState((prev) => ({ ...prev, loading: false }));
    }
    return result;
  }, []);

  const disputeMilestone = useCallback(async (escrowAddress: string, milestoneId: string, reason: string, signer: any) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const result = await campaignService.disputeMilestone(escrowAddress, milestoneId, reason, signer);
    if (!result.success) {
      setState((prev) => ({ ...prev, loading: false, error: result.error! }));
    } else {
      setState((prev) => ({ ...prev, loading: false }));
    }
    return result;
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    createCampaign,
    backCampaign,
    approveMilestone,
    releaseMilestone,
    disputeMilestone,
    reset,
  };
}