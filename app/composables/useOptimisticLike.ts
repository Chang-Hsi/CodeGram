import { ref, watch } from 'vue'

export function useOptimisticLike(
  liked: () => boolean,
  count: () => number,
  commit: (liked: boolean) => Promise<{ liked: boolean, likeCount: number }>,
) {
  const isLiked = ref(liked())
  const likeCount = ref(Math.max(0, count()))
  const pending = ref(false)

  watch([liked, count], ([nextLiked, nextCount]) => {
    if (!pending.value) {
      isLiked.value = nextLiked
      likeCount.value = Math.max(0, nextCount)
    }
  })

  async function toggle() {
    if (pending.value) return
    const previous = { liked: isLiked.value, count: likeCount.value }
    const desired = !isLiked.value
    isLiked.value = desired
    likeCount.value = Math.max(0, likeCount.value + (desired ? 1 : -1))
    pending.value = true
    try {
      const result = await commit(desired)
      isLiked.value = result.liked
      likeCount.value = Math.max(0, result.likeCount)
    }
    catch (error) {
      isLiked.value = previous.liked
      likeCount.value = previous.count
      throw error
    }
    finally {
      pending.value = false
    }
  }

  return { isLiked, likeCount, pending, toggle }
}
