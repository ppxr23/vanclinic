<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\Product;
use App\Enum\ProductCategory;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/products', name: 'api_products_')]
#[OA\Tag(name: 'Shop')]
#[Security(name: 'Bearer')]
class ProductController extends AbstractController
{
    public function __construct(
        private readonly ProductRepository $productRepository,
        private readonly EntityManagerInterface $em,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    #[OA\Get(
        summary: 'Liste des produits du catalogue',
        parameters: [
            new OA\Parameter(name: 'category', in: 'query', schema: new OA\Schema(type: 'string', enum: ['eyeglasses', 'sunglasses', 'lenses', 'contact_lenses', 'accessories'])),
        ]
    )]
    public function list(Request $request): JsonResponse
    {
        $category = null;
        if ($cat = $request->query->get('category')) {
            $category = ProductCategory::tryFrom($cat);
        }

        $products = $this->productRepository->findActiveByCategory($category);
        return $this->json(array_map([$this, 'serialize'], $products));
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(Product $product): JsonResponse
    {
        return $this->json($this->serialize($product));
    }

    #[Route('/{id}/images', name: 'upload_image', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function uploadImage(Product $product, Request $request): JsonResponse
    {
        $file = $request->files->get('image');
        if (!$file) {
            return $this->json(['error' => 'Aucun fichier fourni'], 400);
        }

        $ext = strtolower($file->getClientOriginalExtension());
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
            return $this->json(['error' => 'Format non supporté (jpg, png, webp)'], 400);
        }

        $dir = $this->getParameter('kernel.project_dir') . '/public/uploads/products/';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $filename = 'product-' . $product->getId() . '-' . uniqid() . '.' . $ext;
        $file->move($dir, $filename);

        $images = $product->getImages() ?? [];
        $images[] = '/uploads/products/' . $filename;
        $product->setImages(array_values($images));
        $this->em->flush();

        return $this->json($this->serialize($product));
    }

    #[Route('/{id}/images/{index}', name: 'delete_image', methods: ['DELETE'], requirements: ['id' => '\d+', 'index' => '\d+'])]
    public function deleteImage(Product $product, int $index): JsonResponse
    {
        $images = $product->getImages() ?? [];
        if (!array_key_exists($index, $images)) {
            return $this->json(['error' => 'Image introuvable'], 404);
        }

        $filepath = $this->getParameter('kernel.project_dir') . '/public' . $images[$index];
        if (file_exists($filepath)) {
            unlink($filepath);
        }

        array_splice($images, $index, 1);
        $product->setImages(array_values($images));
        $this->em->flush();

        return $this->json($this->serialize($product));
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(Product $p): array
    {
        return [
            'id' => $p->getId(),
            'sku' => $p->getSku(),
            'name' => $p->getName(),
            'description' => $p->getDescription(),
            'category' => $p->getCategory()->value,
            'categoryLabel' => $p->getCategory()->getLabel(),
            'brand' => $p->getBrand(),
            'priceMga' => $p->getPriceMga(),
            'stockQuantity' => $p->getStockQuantity(),
            'inStock' => $p->getStockQuantity() > 0,
            'images' => $p->getImages() ?? [],
            'specifications' => $p->getSpecifications() ?? [],
        ];
    }
}
