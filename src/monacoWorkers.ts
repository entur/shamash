// Monaco Editor worker setup for Vite.
//
// This replicates `graphiql/setup-workers/vite` (GraphiQL 5). We keep it in app
// source rather than importing GraphiQL's version because the `?worker` imports,
// when they live in node_modules, break Vite's dependency pre-bundler
// (optimizeDeps cannot scan `?worker`). In app source Vite processes them
// natively, so no optimizeDeps include/exclude juggling is needed.
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker.js?worker';
import GraphQLWorker from 'monaco-graphql/esm/graphql.worker.js?worker';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker';

(globalThis as unknown as { MonacoEnvironment: unknown }).MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    switch (label) {
      case 'json':
        return new JsonWorker();
      case 'graphql':
        return new GraphQLWorker();
    }
    return new EditorWorker();
  },
};
