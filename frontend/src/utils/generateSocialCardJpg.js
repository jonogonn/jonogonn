/**
 * High-Resolution HTML5 Canvas Generator for Official Jonogon News Social Media Poster (.JPG)
 * Generates 1024x1024 HD card matching the official branding template pixel-to-pixel.
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
  fileName = 'jonogon-social-card.jpg'
}) {
  return new Promise(async (resolve, reject) => {
    try {
      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
        } catch (e) {
          // ignore font ready error
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // 1. Draw Clean White Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 1024, 1024);

      // Helper to load image
      const loadImage = (src) => {
        return new Promise((res, rej) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => res(img);
          img.onerror = () => {
            const fallback = new Image();
            fallback.onload = () => res(fallback);
            fallback.onerror = (err) => rej(err);
            fallback.src = src;
          };
          img.src = src;
        });
      };

      const templateSrc = '/news-card-template.png';
      const userPhotoSrc = imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';

      Promise.all([
        loadImage(userPhotoSrc).catch(() => null),
        loadImage(templateSrc).catch(() => null)
      ]).then(([userImg, templateImg]) => {
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

          if (imgRatio > boxRatio) {
            drawH = photoH;
            drawW = photoH * imgRatio;
            drawX = photoX - (drawW - photoW) / 2;
            drawY = photoY;
          } else {
            drawW = photoW;
            drawH = photoW / imgRatio;
            drawX = photoX;
            drawY = photoY - (drawH - photoH) / 2;
          }

          ctx.drawImage(userImg, drawX, drawY, drawW, drawH);
        } else {
          ctx.fillStyle = '#222222';
          ctx.fillRect(photoX, photoY, photoW, photoH);
        }
        ctx.restore();

        // 3. Draw Official Jonogon Template Frame on top (Header logo, QR code, red frame borders, bottom ribbons)
        if (templateImg) {
          ctx.drawImage(templateImg, 0, 0, 1024, 1024);
        }

        // Font family string
        const fontSans = '"Anek Bangla", "Hind Siliguri", "Noto Sans Bengali", sans-serif';

        // 4. Draw Date inside Golden Pill (Dead-Center: X=512, Y=180)
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

        // 6. Draw Text Section (Kicker & Headline)
        const rawTitle = title || 'একবছরে গরিব জনগণ বেড়েছে প্রায় ২১ লাখ !';
        let line1 = '';
        let line2 = '';

        if (manualLineBreak && manualLineBreak.trim()) {
          const parts = manualLineBreak.split('|');
          line1 = parts[0]?.trim() || '';
          line2 = parts.slice(1).join(' ').trim();
        } else if (rawTitle.includes('\n')) {
          const parts = rawTitle.split('\n');
          line1 = parts[0]?.trim() || '';
          line2 = parts.slice(1).join(' ').trim();
        } else if (rawTitle.includes('|')) {
          const parts = rawTitle.split('|');
          line1 = parts[0]?.trim() || '';
          line2 = parts.slice(1).join(' ').trim();
        } else {
          const words = rawTitle.trim().split(/\s+/);
          if (words.length <= 4) {
            line1 = rawTitle;
            line2 = '';
          } else if (words.length <= 6) {
            const splitAt = Math.max(2, words.length - 2);
            line1 = words.slice(0, splitAt).join(' ');
            line2 = words.slice(splitAt).join(' ');
          } else {
            const splitAt = Math.ceil(words.length * 0.58);
            line1 = words.slice(0, splitAt).join(' ');
            line2 = words.slice(splitAt).join(' ');
          }
        }

        const line1Color = colorMode === 'blue' ? '#0C1D48' : colorMode === 'dark' ? '#111827' : '#E50914';
        const line2Color = colorMode === 'red' ? '#E50914' : colorMode === 'dark' ? '#111827' : '#0C1D48';

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Coordinated Positioning in the text box (Y: 725px to 970px, Center: 848px)
        if (kicker && line1 && line2) {
          // 3 tiers: Kicker, Line 1, Line 2
          ctx.font = `800 ${kickerFontSize || 28}px ${fontSans}`;
          ctx.fillStyle = '#B82A24';
          ctx.fillText(kicker, 512, 762);

          ctx.font = `900 ${titleFontSize || 48}px ${fontSans}`;
          ctx.fillStyle = line1Color;
          ctx.fillText(line1, 512, 826);

          ctx.font = `900 ${(titleFontSize || 48) + 4}px ${fontSans}`;
          ctx.fillStyle = line2Color;
          ctx.fillText(line2, 512, 888);
        } else if (kicker && line1 && !line2) {
          // 2 tiers: Kicker, Line 1
          ctx.font = `800 ${kickerFontSize || 28}px ${fontSans}`;
          ctx.fillStyle = '#B82A24';
          ctx.fillText(kicker, 512, 785);

          ctx.font = `900 ${titleFontSize || 50}px ${fontSans}`;
          ctx.fillStyle = line1Color;
          ctx.fillText(line1, 512, 856);
        } else if (!kicker && line1 && line2) {
          // 2 tiers: Line 1, Line 2
          ctx.font = `900 ${titleFontSize || 50}px ${fontSans}`;
          ctx.fillStyle = line1Color;
          ctx.fillText(line1, 512, 808);

          ctx.font = `900 ${(titleFontSize || 50) + 4}px ${fontSans}`;
          ctx.fillStyle = line2Color;
          ctx.fillText(line2, 512, 876);
        } else if (line1) {
          // Single Line
          ctx.font = `900 ${titleFontSize || 52}px ${fontSans}`;
          ctx.fillStyle = line1Color;
          ctx.fillText(line1, 512, 848);
        }

        // 7. Draw Dynamic Category in Bottom Red Bar ({sub_group} । {category})
        ctx.fillStyle = '#E50914';
        ctx.fillRect(298, 978, 442, 46);

        ctx.font = `800 18px ${fontSans}`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(category || 'সারাদেশ । বাংলাদেশ', 519, 1001);

        // 8. Convert to JPEG Blob and Download
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas export failed'));
              return;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName.endsWith('.jpg') ? fileName : `${fileName}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            resolve(true);
          },
          'image/jpeg',
          0.96
        );
      });
    } catch (err) {
      reject(err);
    }
  });
}
