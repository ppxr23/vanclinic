import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../test/mocks';
import { api } from '@/lib/api';
import Shop from './Shop';

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

const PRODUCTS = [
  { id: 1, name: 'Lunettes de vue classiques', category: 'eyeglasses', priceMga: 150000, description: 'Monture élégante' },
  { id: 2, name: 'Lunettes de soleil UV', category: 'sunglasses', priceMga: 200000, description: 'Protection maximale' },
  { id: 3, name: 'Étui de rangement', category: 'accessories', priceMga: 25000, description: 'Protection robuste' },
];

const openCart = async () => {
  fireEvent.click(screen.getByTestId('cart-button'));
  await waitFor(() => {
    expect(screen.getAllByText(/shop\.continueShopping/).length).toBeGreaterThanOrEqual(1);
  });
};

const addProductAndOpenCart = async () => {
  await waitFor(() => screen.getAllByTestId('product-card'));
  fireEvent.click(screen.getAllByText('shop.add')[0]);
  await openCart();
};

const goToPayment = async () => {
  await addProductAndOpenCart();
  fireEvent.click(screen.getByText('shop.checkout'));
  await waitFor(() => screen.getByText('shop.paymentMethod'));
};

const selectPayAndConfirm = async () => {
  await goToPayment();
  fireEvent.click(screen.getByText('Orange Money'));
  await waitFor(() => screen.getByPlaceholderText('+261 32 XX XX XX'));
  fireEvent.click(screen.getByText('shop.confirmPayment'));
};

describe('Shop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.get.mockResolvedValue({ data: PRODUCTS });
    mockApi.post.mockImplementation((url: string) => {
      if (url === '/orders') return Promise.resolve({ data: { order: { id: 1, orderNumber: 'VC-ORD-2026-000001' } } });
      if (url.startsWith('/payments/order/')) return Promise.resolve({ data: { message: 'ok' } });
      return Promise.resolve({ data: {} });
    });
  });

  it('affiche les produits depuis l\'API', async () => {
    render(<Shop />);
    await waitFor(() => {
      expect(screen.getAllByTestId('product-card').length).toBe(3);
      expect(screen.getByText('Lunettes de vue classiques')).toBeInTheDocument();
    });
  });

  it('affiche "Aucun produit" quand l\'API retourne vide', async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    render(<Shop />);
    await waitFor(() => {
      expect(screen.getByTestId('empty-products')).toBeInTheDocument();
    });
  });

  it('filtre les produits par catégorie eyeglasses', async () => {
    render(<Shop />);
    await waitFor(() => screen.getAllByTestId('product-card'));
    fireEvent.click(screen.getByText('shop.glasses'));
    await waitFor(() => {
      expect(screen.getAllByTestId('product-card').length).toBe(1);
      expect(screen.queryByText('Lunettes de soleil UV')).not.toBeInTheDocument();
    });
  });

  it('ajoute un produit au panier et met à jour le badge', async () => {
    render(<Shop />);
    await waitFor(() => screen.getAllByTestId('product-card'));
    fireEvent.click(screen.getAllByText('shop.add')[0]);
    await waitFor(() => {
      const badge = screen.getByTestId('cart-button').querySelector('span');
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent).toBe('1');
    });
  });

  it('le panier s\'ouvre et affiche l\'article ajouté', async () => {
    render(<Shop />);
    await addProductAndOpenCart();
    expect(screen.getByText('Lunettes de vue classiques')).toBeInTheDocument();
    expect(screen.getByText('shop.checkout')).toBeInTheDocument();
  });

  it('affiche le panier vide quand rien n\'est ajouté', async () => {
    render(<Shop />);
    await waitFor(() => screen.getAllByTestId('product-card'));
    await openCart();
    expect(screen.getByText('shop.emptyCart')).toBeInTheDocument();
  });

  it('met à jour la quantité dans le panier (+1)', async () => {
    render(<Shop />);
    await waitFor(() => screen.getAllByTestId('product-card'));
    fireEvent.click(screen.getAllByText('shop.add')[0]);
    fireEvent.click(screen.getAllByText('shop.add')[0]);
    await openCart();
    await waitFor(() => {
      const twos = screen.getAllByText('2');
      expect(twos.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('navigue vers le paiement depuis le panier', async () => {
    render(<Shop />);
    await addProductAndOpenCart();
    fireEvent.click(screen.getByText('shop.checkout'));
    await waitFor(() => {
      expect(screen.getByText('shop.paymentMethod')).toBeInTheDocument();
    });
  });

  it('sélectionne une méthode de paiement et affiche le champ téléphone', async () => {
    render(<Shop />);
    await goToPayment();
    fireEvent.click(screen.getByText('Orange Money'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('+261 32 XX XX XX')).toBeInTheDocument();
    });
  });

  it('appelle POST /orders puis POST /payments/order/{id}', async () => {
    render(<Shop />);
    await selectPayAndConfirm();
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/orders', expect.objectContaining({
        items: expect.arrayContaining([expect.objectContaining({ productId: 1, quantity: 1 })]),
      }));
      expect(mockApi.post).toHaveBeenCalledWith('/payments/order/1', expect.objectContaining({
        method: 'orange_money',
      }));
    });
  });

  it('affiche le numéro de commande sur l\'écran succès', async () => {
    render(<Shop />);
    await selectPayAndConfirm();
    await waitFor(() => {
      expect(screen.getByTestId('order-number')).toHaveTextContent('VC-ORD-2026-000001');
    });
  });

  it('affiche une erreur si le paiement échoue', async () => {
    mockApi.post.mockRejectedValue({ response: { data: { error: 'Paiement refusé.' } } });
    render(<Shop />);
    await goToPayment();
    fireEvent.click(screen.getByText('Orange Money'));
    await waitFor(() => screen.getByPlaceholderText('+261 32 XX XX XX'));
    fireEvent.click(screen.getByText('shop.confirmPayment'));
    await waitFor(() => {
      expect(screen.getByText('Paiement refusé.')).toBeInTheDocument();
    });
  });
});
