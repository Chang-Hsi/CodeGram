import type { PostShareAdapter } from '~/types/postShare'

export const mockPostShareAdapter: PostShareAdapter = {
  async createShare(input) {
    await new Promise(resolve => setTimeout(resolve, 60))
    return {
      id: crypto.randomUUID(),
      type: 'share',
      author: input.author,
      content: input.content,
      tags: input.tags,
      images: [],
      createdAt: '剛剛',
      createdAtTimestamp: Date.now(),
      visibility: 'public',
      liked: false,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      sharedPost: input.sharedPost,
    }
  },
}
