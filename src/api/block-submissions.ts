const API_BASE_URL = "https://create-app-block.builddetroit.xyz/api";

/**
 * Block submission status types
 */
export type BlockSubmissionStatus = 'pending' | 'reviewed' | 'approved' | 'rejected';

/**
 * Block submission from the create-app-block API
 */
export interface BlockSubmission {
  id: string;
  blockName: string;
  submitterName: string;
  email: string;
  projectDescription: string;
  projectUrl: string;
  iconUrl: string | null;
  status: BlockSubmissionStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * API response type for block submissions
 */
interface BlockSubmissionsResponse {
  submissions: BlockSubmission[];
}

/**
 * Fetch all block submissions from the create-app-block API
 */
export async function fetchBlockSubmissions(): Promise<BlockSubmission[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/block-submissions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch block submissions: ${response.status}`);
    }

    const data: BlockSubmissionsResponse = await response.json();
    return data.submissions || [];
  } catch (error) {
    console.error('Error fetching block submissions:', error);
    throw error;
  }
}

/**
 * Get the status color for a block submission
 */
export function getStatusColor(status: BlockSubmissionStatus): string {
  switch (status) {
    case 'approved':
      return '#10B981'; // green
    case 'pending':
      return '#F59E0B'; // amber
    case 'reviewed':
      return '#3B82F6'; // blue
    case 'rejected':
      return '#EF4444'; // red
    default:
      return '#6B7280'; // gray
  }
}

/**
 * Get the status label for display
 */
export function getStatusLabel(status: BlockSubmissionStatus): string {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'pending':
      return 'Pending Review';
    case 'reviewed':
      return 'Under Review';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
}
