<template>
  <div class="item">
    {{ id }}
  </div>
</template>
<script>
export default {
  name: 'Item',
  props: {
    id: String | Number
  },
  data() {
    return {}
  }
}
</script>
