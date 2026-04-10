<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  apiUrl: string;
}>();

interface Doenca {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  capitulo: string | null;
  categoria: string | null;
}

const query = ref("");
const results = ref<Doenca[]>([]);
const loading = ref(false);
const hasSearched = ref(false);

let debounceTimer: ReturnType<typeof setTimeout>;

watch(query, (val) => {
  clearTimeout(debounceTimer);
  if (val.length < 2) {
    results.value = [];
    hasSearched.value = false;
    return;
  }
  loading.value = true;
  debounceTimer = setTimeout(async () => {
    try {
      const res = await fetch(
        `${props.apiUrl}/v1/doencas/autocomplete?q=${encodeURIComponent(val)}&limit=10`,
      );
      const json = await res.json();
      results.value = json.data ?? [];
    } catch {
      results.value = [];
    } finally {
      loading.value = false;
      hasSearched.value = true;
    }
  }, 300);
});
</script>

<template>
  <div>
    <input
      v-model="query"
      type="text"
      placeholder="Digite o nome ou codigo da doenca (ex: dengue, A90)..."
      class="w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    />

    <p v-if="loading" class="mt-3 text-sm text-muted-foreground">Buscando...</p>

    <div v-if="results.length > 0" class="mt-4 space-y-2 text-left">
      <div
        v-for="doenca in results"
        :key="doenca.id"
        class="rounded-lg border bg-card p-4 hover:border-primary transition-colors"
      >
        <div class="flex items-baseline gap-2">
          <span class="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {{ doenca.codigo }}
          </span>
          <span class="font-medium">{{ doenca.nome }}</span>
        </div>
        <p v-if="doenca.categoria" class="mt-1 text-xs text-muted-foreground">
          {{ doenca.categoria }}
        </p>
      </div>
    </div>

    <p
      v-if="hasSearched && results.length === 0 && !loading"
      class="mt-3 text-sm text-muted-foreground"
    >
      Nenhum resultado encontrado.
    </p>
  </div>
</template>
