import React from 'react'

const Image = ({ src, alt, width, height, style, priority, ...rest }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src as string} alt={alt} width={width as number} height={height as number} style={style} {...rest} />
)

export default Image
