import { StrictMode } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { PassThrough } from 'node:stream';
import { AppContent } from './App';
import { getRouteSeo, getStructuredData } from './lib/seo';

export { getRouteSeo, getStructuredData };

export function render(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = new PassThrough();

    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    stream.on('error', reject);

    const { pipe } = renderToPipeableStream(
      <StrictMode>
        <StaticRouter location={url}>
          <AppContent />
        </StaticRouter>
      </StrictMode>,
      {
        onAllReady() {
          pipe(stream);
        },
        onError(error) {
          reject(error);
        },
      }
    );
  });
}
