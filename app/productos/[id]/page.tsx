'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Star, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Product, Comment } from '@/lib/supabase';
import { toast } from 'sonner';
import Image from 'next/image';

export default function ProductDetailPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchProductDetails();
    fetchComments();
  }, [user, productId, router]);

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      } else {
        toast.error('Producto no encontrado');
        router.push('/productos');
      }
    } catch (error) {
      toast.error('Error al cargar producto');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim()) {
      toast.error('Escribe un comentario');
      return;
    }

    if (commentText.trim().length < 5) {
      toast.error('El comentario debe tener al menos 5 caracteres');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/products/${productId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentText: commentText.trim(),
          rating
        })
      });

      if (response.ok) {
        toast.success('¡Comentario publicado!');
        setCommentText('');
        setRating(5);
        fetchComments();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al publicar comentario');
      }
    } catch (error) {
      toast.error('Error en el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success(`${product.name} agregado al carrito`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const averageRating = comments.length > 0
    ? comments.reduce((sum, c) => sum + c.rating, 0) / comments.length
    : 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/productos')}
          className="mb-6 text-amber-700 hover:text-amber-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Productos
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="overflow-hidden">
            <div className="relative h-96 w-full bg-amber-100">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          </Card>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-amber-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(averageRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-amber-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-amber-600">
                  ({averageRating.toFixed(1)}) - {comments.length} {comments.length === 1 ? 'comentario' : 'comentarios'}
                </span>
              </div>
              <Badge className="bg-amber-600 text-lg px-4 py-1">
                ${(product.price / 100).toFixed(2)}
              </Badge>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold text-amber-900 mb-3">Descripción</h2>
              <p className="text-amber-700 leading-relaxed">{product.description}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                {product.stock > 0 ? (
                  <p className="text-green-600 font-medium">
                    ✓ En stock ({product.stock} disponibles)
                  </p>
                ) : (
                  <p className="text-red-600 font-medium">✗ Agotado</p>
                )}
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              size="lg"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white text-lg py-6"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Agregar al Carrito
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-amber-900">
              Comentarios y Calificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmitComment} className="space-y-4 p-4 bg-amber-50 rounded-lg">
              <div>
                <Label className="text-amber-900 font-semibold">Tu Calificación</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-amber-700 font-medium">
                    {rating} {rating === 1 ? 'estrella' : 'estrellas'}
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="comment" className="text-amber-900 font-semibold">
                  Tu Comentario
                </Label>
                <Textarea
                  id="comment"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Comparte tu experiencia con este producto..."
                  className="mt-2 min-h-24 border-amber-200 focus:border-amber-500"
                  maxLength={500}
                />
                <p className="text-xs text-amber-600 mt-1">
                  {commentText.length}/500 caracteres (mínimo 5)
                </p>
              </div>

              <Button
                type="submit"
                disabled={submitting || commentText.trim().length < 5}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {submitting ? 'Publicando...' : 'Publicar Comentario'}
              </Button>
            </form>

            <Separator />

            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-amber-600 py-8">
                  Sé el primero en comentar este producto
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-4 border border-amber-200 rounded-lg bg-white">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={comment.users?.photo_url} />
                        <AvatarFallback className="bg-amber-200 text-amber-800">
                          {comment.users?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-amber-900">
                              {comment.users?.full_name || 'Usuario'}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < comment.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-amber-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-amber-600">
                                {new Date(comment.created_at).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-amber-700">{comment.comment_text}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
