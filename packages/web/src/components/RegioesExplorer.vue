<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

const props = defineProps<{
  apiUrl: string;
}>();

interface Estado {
  codigoIbge: string;
  nome: string;
  uf: string | null;
}

interface Municipio {
  id: number;
  codigoIbge: string;
  nome: string;
  tipo: string;
  uf: string | null;
  estado: string | null;
}

const estados = ref<Estado[]>([]);
const ufSelecionada = ref<string>("");
const municipios = ref<Municipio[]>([]);
const filtroMunicipio = ref<string>("");
const loadingEstados = ref(false);
const loadingMunicipios = ref(false);
const totalMunicipios = ref(0);
const erro = ref<string | null>(null);

let debounceTimer: ReturnType<typeof setTimeout>;

onMounted(async () => {
  loadingEstados.value = true;
  try {
    const res = await fetch(`${props.apiUrl}/v1/regioes/estados`);
    const json = await res.json();
    estados.value = (json.data ?? []).sort((a: Estado, b: Estado) =>
      (a.uf ?? "").localeCompare(b.uf ?? ""),
    );
  } catch {
    erro.value = "Nao foi possivel carregar a lista de estados.";
  } finally {
    loadingEstados.value = false;
  }
});

async function carregarMunicipios(uf: string, q = "") {
  if (!uf) {
    municipios.value = [];
    totalMunicipios.value = 0;
    return;
  }
  loadingMunicipios.value = true;
  erro.value = null;
  try {
    const params = new URLSearchParams({ limit: "100" });
    if (q) params.set("q", q);
    const res = await fetch(
      `${props.apiUrl}/v1/regioes/estados/${uf}/municipios?${params}`,
    );
    const json = await res.json();
    municipios.value = json.data ?? [];
    totalMunicipios.value = json.meta?.total ?? municipios.value.length;
  } catch {
    erro.value = "Nao foi possivel carregar os municipios.";
    municipios.value = [];
  } finally {
    loadingMunicipios.value = false;
  }
}

watch(ufSelecionada, (uf) => {
  filtroMunicipio.value = "";
  carregarMunicipios(uf);
});

watch(filtroMunicipio, (val) => {
  if (!ufSelecionada.value) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    carregarMunicipios(ufSelecionada.value, val);
  }, 300);
});
</script>

<template>
  <div class="space-y-6">
    <div>
      <label
        for="uf-select"
        class="block text-sm font-medium mb-2"
      >
        Estado (UF)
      </label>
      <select
        id="uf-select"
        v-model="ufSelecionada"
        :disabled="loadingEstados"
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">
          {{ loadingEstados ? "Carregando estados..." : "Selecione um estado" }}
        </option>
        <option
          v-for="estado in estados"
          :key="estado.codigoIbge"
          :value="estado.uf"
        >
          {{ estado.uf }} — {{ estado.nome }}
        </option>
      </select>
    </div>

    <div v-if="ufSelecionada">
      <label
        for="municipio-filter"
        class="block text-sm font-medium mb-2"
      >
        Filtrar municipios
      </label>
      <input
        id="municipio-filter"
        v-model="filtroMunicipio"
        type="text"
        placeholder="Digite para filtrar..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>

    <div
      v-if="erro"
      class="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
    >
      {{ erro }}
    </div>

    <div v-if="loadingMunicipios" class="text-sm text-muted-foreground">
      Buscando municipios...
    </div>

    <div v-if="ufSelecionada && !loadingMunicipios && municipios.length > 0">
      <p class="text-sm text-muted-foreground mb-3">
        Mostrando {{ municipios.length }} de {{ totalMunicipios.toLocaleString("pt-BR") }} municipios
      </p>
      <ul class="grid gap-2 sm:grid-cols-2">
        <li
          v-for="m in municipios"
          :key="m.id"
          class="rounded-md border bg-card p-3 text-sm"
        >
          <div class="font-medium">{{ m.nome }}</div>
          <div class="text-xs text-muted-foreground mt-0.5">
            IBGE {{ m.codigoIbge }}
          </div>
        </li>
      </ul>
    </div>

    <div
      v-if="ufSelecionada && !loadingMunicipios && municipios.length === 0 && !erro"
      class="text-sm text-muted-foreground"
    >
      Nenhum municipio encontrado.
    </div>
  </div>
</template>
