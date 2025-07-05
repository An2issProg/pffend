const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

/**
 * Get the full URL for a product image
 * @param imagePath The image path from the database
 * @returns Full URL to the image or a fallback image
 */
export const getProductImageUrl = (imagePath?: string | null): string => {
  if (!imagePath) {
    return '/placeholder-product.svg';
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Handle default image path
  if (imagePath.includes('default-product')) {
    return `${API_URL}/images/${imagePath}`;
  }

  // Handle uploaded images
  if (imagePath.startsWith('uploads/') || imagePath.startsWith('/uploads/')) {
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${API_URL}${normalizedPath}`;
  }

  // For any other case, try to use it as is with the API URL
  return `${API_URL}/${imagePath}`;
};

/**
 * Handle image loading errors by replacing with a fallback
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  if (target.src.endsWith('placeholder-product.svg')) return; // Prevent infinite loop
  target.onerror = null;
  target.src = '/placeholder-product.svg';
};

/**
 * Get the correct image source for Next.js Image component
 */
export const getImageProps = (imagePath?: string | null, alt: string = 'Product image') => {
  const src = getProductImageUrl(imagePath);
  return {
    src,
    alt,
    onError: handleImageError,
    unoptimized: process.env.NODE_ENV === 'development' || src.startsWith('http'),
  };
};
