import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../test/mocks';
import { api } from '@/lib/api';
import MedicalRecord from './MedicalRecord';

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn> };

const RECORDS = [
  {
    id: 1,
    consultationDate: '2026-04-18',
    chiefComplaint: 'Trouble de la vision',
    diagnosis: 'Myopie légère',
    treatment: 'Prescription lunettes',
    prescription: 'Gouttes oculaires lubrifiant - 3x/jour\nVitamine A - 1 comprimé/jour',
    observations: 'Examen de routine, prescription mise à jour.',
    rightEyeSphere: '1.50',
    rightEyeCylinder: '-1.00',
    rightEyeAxis: 90,
    rightEyeVisionCorrected: '20/20',
    leftEyeSphere: '1.25',
    leftEyeCylinder: '-0.75',
    leftEyeAxis: 85,
    leftEyeVisionCorrected: '20/25',
    createdBy: { firstName: 'Marie', lastName: 'Rakoto' },
    createdAt: '2026-04-18T10:00:00',
  },
  {
    id: 2,
    consultationDate: '2026-02-10',
    chiefComplaint: 'Suivi post-opératoire',
    diagnosis: 'Cicatrisation normale',
    observations: 'Pas de complications.',
    createdBy: { firstName: 'Jean', lastName: 'Rakotondrazaka' },
    createdAt: '2026-02-10T09:00:00',
  },
];

describe('MedicalRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.get.mockResolvedValue({ data: RECORDS });
  });

  it('affiche le titre de la page', () => {
    render(<MedicalRecord />);
    expect(screen.getByText('medicalRecord.title')).toBeInTheDocument();
  });

  it('affiche "Aucun dossier" quand API retourne vide', async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    render(<MedicalRecord />);
    await waitFor(() => {
      expect(screen.getByTestId('empty-records')).toBeInTheDocument();
    });
  });

  it('affiche la prescription active depuis l\'API', async () => {
    render(<MedicalRecord />);
    await waitFor(() => {
      expect(screen.getByText('medicalRecord.activePrescription')).toBeInTheDocument();
      expect(screen.getByText('Dr. Marie Rakoto')).toBeInTheDocument();
    });
  });

  it('affiche les données de sphère/cylindre', async () => {
    render(<MedicalRecord />);
    await waitFor(() => {
      expect(screen.getByText('1.50')).toBeInTheDocument();
      expect(screen.getByText('-1.00')).toBeInTheDocument();
    });
  });

  it('affiche la prescription médicamenteuse', async () => {
    render(<MedicalRecord />);
    await waitFor(() => {
      expect(screen.getByText(/Gouttes oculaires/)).toBeInTheDocument();
    });
  });

  it('bascule sur l\'onglet Historique et affiche les consultations', async () => {
    render(<MedicalRecord />);
    await waitFor(() => screen.getByText('medicalRecord.activePrescription'));
    fireEvent.click(screen.getByText('medicalRecord.history'));
    await waitFor(() => {
      expect(screen.getByText('Trouble de la vision')).toBeInTheDocument();
      expect(screen.getByText('Suivi post-opératoire')).toBeInTheDocument();
    });
  });

  it('étend un accord avec les notes au clic', async () => {
    render(<MedicalRecord />);
    await waitFor(() => screen.getByText('medicalRecord.activePrescription'));
    fireEvent.click(screen.getByText('medicalRecord.history'));
    await waitFor(() => screen.getByText('Trouble de la vision'));
    fireEvent.click(screen.getByText('Trouble de la vision'));
    await waitFor(() => {
      expect(screen.getByText(/Examen de routine/)).toBeInTheDocument();
    });
  });

  it('bascule sur l\'onglet Vision et affiche les données', async () => {
    render(<MedicalRecord />);
    await waitFor(() => screen.getByText('medicalRecord.activePrescription'));
    fireEvent.click(screen.getByText('medicalRecord.vision'));
    await waitFor(() => {
      expect(screen.getByText('medicalRecord.visualAcuity')).toBeInTheDocument();
      expect(screen.getByText('20/20')).toBeInTheDocument();
      expect(screen.getByText('20/25')).toBeInTheDocument();
    });
  });

  it('gère l\'erreur API sans planter', async () => {
    mockApi.get.mockRejectedValue(new Error('Network error'));
    render(<MedicalRecord />);
    await waitFor(() => {
      expect(screen.getByTestId('empty-records')).toBeInTheDocument();
    });
  });
});
