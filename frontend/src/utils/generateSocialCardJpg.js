/**
 * High-Resolution HTML5 Canvas Generator for Official Jonogon News Social Media Poster (.JPG)
 * Generates 1024x1024 HD card matching the official branding template pixel-to-pixel.
 * Robust against cross-origin images (CORS), never taints the canvas, and prevents download hanging.
 */

export async function generateSocialCardJpg({
  title = '',
  kicker = '',
  imageUrl = '',
  caption = 'ছবি: সংগৃহীত',
  category = 'সারাদেশ । বাংলাদেশ',
  dateBn = '',
  titleFontSize = 48,
  kickerFontSize = 26,
  lineHeight = 1.18,
  colorMode = 'dual',
  manualLineBreak = '',
  imagePosition = 'center center',
  fileName = 'jonogon-social-card.jpg',
  returnBlob = false
}) {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
        } catch (e) {
          // ignore font loading error
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      // 1. Draw Clean White Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 1024, 1024);

      // Helper to load image safely with CORS and timeout
      const loadImage = async (src) => {
        if (!src) return null;

        // Try direct Image load with anonymous CORS
        const tryImageElement = (url) => {
          return new Promise((res) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            const timer = setTimeout(() => {
              img.onload = null;
              img.onerror = null;
              res(null);
            }, 8000);

            img.onload = () => {
              clearTimeout(timer);
              res(img);
            };
            img.onerror = () => {
              clearTimeout(timer);
              res(null);
            };
            img.src = url;
          });
        };

        // 1. Try direct CORS load
        let loaded = await tryImageElement(src);
        if (loaded) return loaded;

        // 2. If direct load failed and it's a remote URL, try fetching as Blob with CORS proxy
        if (src.startsWith('http://') || src.startsWith('https://')) {
          try {
            // First try direct fetch as blob
            const fetchDirect = await fetch(src, { mode: 'cors' }).catch(() => null);
            if (fetchDirect && fetchDirect.ok) {
              const blob = await fetchDirect.blob();
              const objectUrl = URL.createObjectURL(blob);
              loaded = await tryImageElement(objectUrl);
              if (loaded) return loaded;
            }

            // Next try server-side CORS proxy
            const proxyUrl = `/api/media.php?action=proxy_image&url=${encodeURIComponent(src)}`;
            const fetchProxy = await fetch(proxyUrl).catch(() => null);
            if (fetchProxy && fetchProxy.ok) {
              const blob = await fetchProxy.blob();
              const objectUrl = URL.createObjectURL(blob);
              loaded = await tryImageElement(objectUrl);
              if (loaded) return loaded;
            }
          } catch (fetchErr) {
            console.warn('Proxy image fetch fallback error:', fetchErr);
          }
        }

        return null;
      };

      // Multi-candidate paths for official template frame
      const getTemplateCandidates = () => {
        const candidates = [];
        if (typeof window !== 'undefined') {
          const origin = window.location.origin;
          const isSubdir = window.location.pathname.includes('/janogon');
          if (isSubdir) {
            candidates.push(`${origin}/janogon/news-card-template.png`);
            candidates.push('/janogon/news-card-template.png');
          }
          candidates.push(`${origin}/news-card-template.png`);
        }
        candidates.push('/news-card-template.png');
        candidates.push('./news-card-template.png');
        return [...new Set(candidates)];
      };

      const loadTemplateImage = async () => {
        const paths = getTemplateCandidates();
        for (const p of paths) {
          const img = await loadImage(p);
          if (img) return img;
        }
        return null;
      };

      const userPhotoSrc = imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';

      Promise.all([
        loadImage(userPhotoSrc).catch(() => null),
        loadTemplateImage().catch(() => null)
      ])
        .then(([userImg, templateImg]) => {
          try {
            // 2. Draw User Photo inside bounded window with curved top-left corner
            const photoX = 65;
            const photoY = 160;
            const photoW = 894;
            const photoH = 512;
            const radius = 135;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(photoX + radius, photoY);
            ctx.lineTo(photoX + photoW, photoY);
            ctx.lineTo(photoX + photoW, photoY + photoH);
            ctx.lineTo(photoX, photoY + photoH);
            ctx.lineTo(photoX, photoY + radius);
            ctx.quadraticCurveTo(photoX, photoY, photoX + radius, photoY);
            ctx.closePath();
            ctx.clip();

            if (userImg) {
              const imgRatio = userImg.width / userImg.height;
              const boxRatio = photoW / photoH;
              let drawW, drawH, drawX, drawY;

              let alignX = 'center';
              let alignY = 'center';
              if (typeof imagePosition === 'string') {
                const posLower = imagePosition.toLowerCase();
                if (posLower.includes('left')) alignX = 'left';
                if (posLower.includes('right')) alignX = 'right';
                if (posLower.includes('top')) alignY = 'top';
                if (posLower.includes('bottom')) alignY = 'bottom';
              }

              if (imgRatio > boxRatio) {
                drawH = photoH;
                drawW = photoH * imgRatio;
                drawY = photoY;
                if (alignX === 'left') {
                  drawX = photoX;
                } else if (alignX === 'right') {
                  drawX = photoX - (drawW - photoW);
                } else {
                  drawX = photoX - (drawW - photoW) / 2;
                }
              } else {
                drawW = photoW;
                drawH = photoW / imgRatio;
                drawX = photoX;
                if (alignY === 'top') {
                  drawY = photoY;
                } else if (alignY === 'bottom') {
                  drawY = photoY - (drawH - photoH);
                } else {
                  drawY = photoY - (drawH - photoH) / 2;
                }
              }

              ctx.drawImage(userImg, drawX, drawY, drawW, drawH);
            } else {
              // Graceful dark fallback background with subtle brand gradient
              ctx.fillStyle = '#1A1D24';
              ctx.fillRect(photoX, photoY, photoW, photoH);
              const grad = ctx.createLinearGradient(photoX, photoY, photoX + photoW, photoY + photoH);
              grad.addColorStop(0, '#232731');
              grad.addColorStop(1, '#0F1218');
              ctx.fillStyle = grad;
              ctx.fillRect(photoX, photoY, photoW, photoH);
            }
            ctx.restore();

            // 3. Draw Official Jonogon Template Frame on top (Header logo, QR code, red frame borders, bottom ribbons)
            if (templateImg) {
              ctx.drawImage(templateImg, 0, 0, 1024, 1024);
            }

            // Font family string
            const fontSans = '"Anek Bangla", "Hind Siliguri", "Noto Sans Bengali", sans-serif';

            // 4. Draw Date inside Golden Pill
            const dateText = dateBn || new Date().toLocaleDateString('bn-BD', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            });

            ctx.font = `800 20px ${fontSans}`;
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(dateText, 512, 180);

            // 5. Draw Photo Caption (bottom right under photo frame, right-aligned to photo edge)
            const fullCaption = caption ? (caption.startsWith('ছবি') ? caption : `ছবি: ${caption}`) : 'ছবি: সংগৃহীত';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(840, 680, 120, 32);

            ctx.font = `800 15px ${fontSans}`;
            ctx.fillStyle = '#222222';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(fullCaption, 958, 696);

            // 6. Draw Text Section (Kicker & Headline with Auto Line Wrap & Auto 1px Font Shrink)
            // Safe Margins (Generous 77px gap on both sides, ensuring text never touches card borders)
            const maxTextWidth = 870;
            const textMinY = 724;
            const textMaxY = 952;
            const textMaxHeight = textMaxY - textMinY; // 228px available height
            const textCenterY = (textMinY + textMaxY) / 2; // 838px

            // A. Kicker Layout (if present)
            let kickerSize = kickerFontSize > 22 ? kickerFontSize : Math.round((kickerFontSize || 15) * 1.85);
            if (kicker && kicker.trim()) {
              ctx.font = `800 ${kickerSize}px ${fontSans}`;
              while (kickerSize > 16 && ctx.measureText(kicker.trim()).width > maxTextWidth) {
                kickerSize -= 1;
                ctx.font = `800 ${kickerSize}px ${fontSans}`;
              }
            }
            const hasKicker = Boolean(kicker && kicker.trim());
            const kickerHeight = hasKicker ? Math.round(kickerSize * 1.25) : 0;
            const kickerBottomGap = hasKicker ? 12 : 0;
            const availableHeadlineHeight = textMaxHeight - kickerHeight - kickerBottomGap;

            // B. Headline Auto Wrap & Auto 1px Font Size Shrinking
            const rawTitle = (title || 'একবছরে গরিব জনগণ বেড়েছে প্রায় ২১ লাখ !').trim();
            let titleSize = titleFontSize > 36 ? titleFontSize : Math.round((titleFontSize || 24) * 2.25);
            const minTitleSize = 22;

            let finalLines = [];

            while (titleSize >= minTitleSize) {
              ctx.font = `900 ${titleSize}px ${fontSans}`;

              let lines = [];
              const hasManualSplit = manualLineBreak && manualLineBreak.trim();
              const segments = hasManualSplit
                ? manualLineBreak.split(/[|\n]/).map((s) => s.trim()).filter(Boolean)
                : rawTitle.includes('\n') || rawTitle.includes('|')
                ? rawTitle.split(/[|\n]/).map((s) => s.trim()).filter(Boolean)
                : null;

              if (segments && segments.length > 0) {
                for (const seg of segments) {
                  const segWords = seg.split(/\s+/);
                  let curLine = '';
                  for (const w of segWords) {
                    const test = curLine ? `${curLine} ${w}` : w;
                    if (ctx.measureText(test).width <= maxTextWidth) {
                      curLine = test;
                    } else {
                      if (curLine) lines.push(curLine);
                      curLine = w;
                    }
                  }
                  if (curLine) lines.push(curLine);
                }
              } else {
                const words = rawTitle.split(/\s+/);
                if (words.length <= 4 && ctx.measureText(rawTitle).width <= maxTextWidth) {
                  lines = [rawTitle];
                } else {
                  // Attempt clean balanced 2-line split
                  const mid = Math.ceil(words.length / 2);
                  const try1 = words.slice(0, mid).join(' ');
                  const try2 = words.slice(mid).join(' ');

                  if (ctx.measureText(try1).width <= maxTextWidth && ctx.measureText(try2).width <= maxTextWidth) {
                    lines = [try1, try2];
                  } else {
                    // Word-by-word line wrapping
                    let curLine = '';
                    for (const w of words) {
                      const test = curLine ? `${curLine} ${w}` : w;
                      if (ctx.measureText(test).width <= maxTextWidth) {
                        curLine = test;
                      } else {
                        if (curLine) lines.push(curLine);
                        curLine = w;
                      }
                    }
                    if (curLine) lines.push(curLine);
                  }
                }
              }

              // Check if all lines fit within maxTextWidth and total height fits within available area
              const lineSpacing = Math.round(titleSize * 1.25);
              const totalHeadlineHeight = lines.length * lineSpacing;
              const anyOverflow = lines.some((l) => ctx.measureText(l).width > maxTextWidth);

              if (!anyOverflow && totalHeadlineHeight <= availableHeadlineHeight && lines.length <= 3) {
                finalLines = lines;
                break;
              }

              finalLines = lines;
              // Auto-shrink by 1px
              titleSize -= 1;
            }

            const line1Color = colorMode === 'blue' ? '#0C1D48' : colorMode === 'dark' ? '#111827' : '#E50914';
            const line2Color = colorMode === 'red' ? '#E50914' : colorMode === 'dark' ? '#111827' : '#0C1D48';

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Coordinated Vertical Centering in Text Section
            const headlineLineSpacing = Math.round(titleSize * 1.25);
            const totalTextHeight = (hasKicker ? kickerHeight + kickerBottomGap : 0) + (finalLines.length * headlineLineSpacing);
            let currentDrawY = textCenterY - (totalTextHeight / 2) + (hasKicker ? kickerHeight / 2 : headlineLineSpacing / 2);

            if (hasKicker) {
              ctx.font = `800 ${kickerSize}px ${fontSans}`;
              ctx.fillStyle = '#B82A24';
              ctx.fillText(kicker.trim(), 512, currentDrawY);
              currentDrawY += (kickerHeight / 2) + kickerBottomGap + (headlineLineSpacing / 2);
            }

            finalLines.forEach((textLine, idx) => {
              // Line 0 is vibrant editorial red, remaining lines in navy blue
              ctx.font = `900 ${idx === 0 ? titleSize : titleSize + 2}px ${fontSans}`;
              ctx.fillStyle = idx === 0 ? line1Color : line2Color;
              ctx.fillText(textLine, 512, currentDrawY);
              currentDrawY += headlineLineSpacing;
            });

            // 7. Draw Dynamic Category in Bottom Bar
            ctx.font = `800 18px ${fontSans}`;
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(category || 'সারাদেশ । বাংলাদেশ', 519, 1001);

            // 8. Convert to JPEG Blob and Download / Return
            const triggerDownloadOrResolve = (blob) => {
              if (returnBlob) {
                resolve(blob);
                return;
              }
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName.endsWith('.jpg') ? fileName : `${fileName}.jpg`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(() => {
                try {
                  URL.revokeObjectURL(url);
                } catch (e) {}
              }, 4000);
              resolve(true);
            };

            // Attempt toBlob first
            try {
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    triggerDownloadOrResolve(blob);
                  } else {
                    // Fallback to dataURL conversion if toBlob returned null
                    try {
                      const dataUrl = canvas.toDataURL('image/jpeg', 0.96);
                      if (returnBlob) {
                        fetch(dataUrl)
                          .then((res) => res.blob())
                          .then((b) => resolve(b))
                          .catch((e) => reject(e));
                      } else {
                        const a = document.createElement('a');
                        a.href = dataUrl;
                        a.download = fileName.endsWith('.jpg') ? fileName : `${fileName}.jpg`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        resolve(true);
                      }
                    } catch (dErr) {
                      reject(dErr);
                    }
                  }
                },
                'image/jpeg',
                0.96
              );
            } catch (blobErr) {
              // If toBlob threw an exception, fallback to dataURL
              try {
                const dataUrl = canvas.toDataURL('image/jpeg', 0.96);
                if (returnBlob) {
                  fetch(dataUrl)
                    .then((res) => res.blob())
                    .then((b) => resolve(b))
                    .catch((e) => reject(e));
                } else {
                  const a = document.createElement('a');
                  a.href = dataUrl;
                  a.download = fileName.endsWith('.jpg') ? fileName : `${fileName}.jpg`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  resolve(true);
                }
              } catch (dErr) {
                reject(blobErr || dErr);
              }
            }
          } catch (renderErr) {
            reject(renderErr);
          }
        })
        .catch((promiseErr) => {
          reject(promiseErr);
        });
    } catch (err) {
      reject(err);
    }
  });
}

export default generateSocialCardJpg;
