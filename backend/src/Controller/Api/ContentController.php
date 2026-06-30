<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\EducationalContent;
use App\Repository\EducationalContentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/public/content', name: 'api_content_')]
#[OA\Tag(name: 'Content')]
class ContentController extends AbstractController
{
    public function __construct(
        private readonly EducationalContentRepository $repository,
        private readonly EntityManagerInterface $em,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    #[OA\Get(
        summary: 'Liste des contenus éducatifs publiés',
        parameters: [
            new OA\Parameter(name: 'lang', in: 'query', schema: new OA\Schema(type: 'string', enum: ['fr', 'mg'], default: 'fr')),
        ]
    )]
    public function list(Request $request): JsonResponse
    {
        $lang = $request->query->get('lang', 'fr');
        $contents = $this->repository->findPublished($lang);

        return $this->json(array_map([$this, 'serializeShort'], $contents));
    }

    #[Route('/{slug}', name: 'show', methods: ['GET'])]
    #[OA\Get(summary: 'Détail d\'un contenu éducatif')]
    public function show(string $slug): JsonResponse
    {
        $content = $this->repository->findOneBy(['slug' => $slug, 'isPublished' => true]);
        if (!$content) {
            return $this->json(['error' => 'Contenu introuvable'], 404);
        }

        $content->incrementViewCount();
        $this->em->flush();

        return $this->json($this->serializeFull($content));
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeShort(EducationalContent $c): array
    {
        return [
            'id' => $c->getId(),
            'slug' => $c->getSlug(),
            'title' => $c->getTitle(),
            'contentType' => $c->getContentType(),
            'language' => $c->getLanguage(),
            'excerpt' => $c->getExcerpt(),
            'coverImage' => $c->getCoverImage(),
            'publishedAt' => $c->getPublishedAt()?->format(\DateTimeInterface::ATOM),
            'viewCount' => $c->getViewCount(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeFull(EducationalContent $c): array
    {
        return array_merge($this->serializeShort($c), [
            'body' => $c->getBody(),
            'mediaUrl' => $c->getMediaUrl(),
            'author' => $c->getAuthor()?->getFullName(),
        ]);
    }
}
