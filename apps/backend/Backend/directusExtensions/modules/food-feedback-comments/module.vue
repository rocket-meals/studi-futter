<template>
  <private-view title="Food Feedback Comments">
    <v-data-table :items="feedbacks" :headers="headers" :loading="loading">
      <template #item.actions="{ item }">
        <v-button small @click="goToItem(item.id)">Reply</v-button>
      </template>
    </v-data-table>
  </private-view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useApi, useRouter } from '@directus/extensions-sdk';

const api = useApi();
const router = useRouter();

const feedbacks = ref([]);
const loading = ref(true);
const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Comment', value: 'comment' },
  { text: 'Food', value: 'food' },
  { text: 'Actions', value: 'actions', sortable: false }
];

async function loadFeedbacks() {
  loading.value = true;
  try {
    const { data } = await api.get('/items/food_feedbacks', {
      params: {
        fields: ['id', 'comment', 'food'],
        filter: { comment: { _nnull: true } }
      }
    });
    feedbacks.value = data.data;
  } catch (err) {
    console.error(err);
  }
  loading.value = false;
}

function goToItem(id) {
  router.push(`/content/food_feedbacks/${id}`);
}

onMounted(loadFeedbacks);
</script>
