<script setup lang="ts">
import FriendRequestsSection from "~/components/friends/FriendRequestsSection.vue";
import FriendSuggestionsSection from "~/components/friends/FriendSuggestionsSection.vue";

useSeoMeta({
  title: "朋友｜CodeGram",
  description: "CodeGram 朋友頁面",
});

const friendRequests = [
  {
    id: "request-1",
    name: "zyw.522",
    avatarUrl:
      "https://i.pinimg.com/736x/d5/b3/91/d5b39145571a4f3e0f5016cd9675b070.jpg",
    mutualFriendCount: 5,
  },
  {
    id: "request-2",
    name: "Hau_0313",
    avatarUrl:
      "https://i.pinimg.com/736x/d4/cd/57/d4cd57ceefa0163261f584c50c71d889.jpg",
    mutualFriendCount: 2,
  },
  {
    id: "request-3",
    name: "cici14122001",
    avatarUrl:
      "https://i.pinimg.com/736x/e1/b3/55/e1b355281d8085cee42af051dc1d2a8e.jpg",
    mutualFriendCount: 2,
  },
  {
    id: "request-4",
    name: "yyyijing",
    avatarUrl:
      "https://i.pinimg.com/736x/16/c8/4a/16c84a41acb8389138428e60a3884fe8.jpg",
    mutualFriendCount: 2,
  },
  {
    id: "request-5",
    name: "Jay141516",
    avatarUrl:
      "https://i.pinimg.com/736x/de/49/67/de4967d48e7765fa2fc19b1316551ae1.jpg",
    mutualFriendCount: 2,
  },
];

const friendSuggestions = [
  {
    id: "suggestion-1",
    name: "王博",
    avatarUrl: "https://i.pinimg.com/736x/8b/03/98/8b039836b8d10d0aaf76240004ac7ff5.jpg",
    followerCount: "1,724",
  },
  {
    id: "suggestion-2",
    name: "李青青",
    avatarUrl: "https://i.pinimg.com/736x/9c/37/1e/9c371e674aad0eb0b0061fc98e1294f1.jpg",
    mutualFriendCount: 2,
  },
  {
    id: "suggestion-3",
    name: "Dennis Chen",
    avatarUrl: "https://i.pinimg.com/1200x/80/c0/15/80c0159c635992af9cc618175ce20bbf.jpg",
    mutualFriendCount: 6,
  },
  {
    id: "suggestion-4",
    name: "Shinchin Lin",
    avatarUrl: "https://i.pinimg.com/1200x/f7/61/c1/f761c1f9a40b3fa8a41096c11b82bff5.jpg",
    followerCount: "2,031",
  },
  {
    id: "suggestion-5",
    name: "陳介中",
    avatarUrl: "https://i.pinimg.com/1200x/99/4a/4c/994a4cd10f38bf10f4e00bc8a3a21f36.jpg",
    followerCount: "1.3 萬",
  },
  {
    id: "suggestion-6",
    name: "Lin Hung Chang",
    avatarUrl: "https://i.pinimg.com/736x/f4/16/70/f416702913841c7bdb2134a72cdab9d6.jpg",
    followerCount: "2,799",
  },
  {
    id: "suggestion-7",
    name: "陳寶媛",
    avatarUrl: "https://i.pinimg.com/736x/bc/e2/15/bce215ec9200ca86e947ed1d2134350d.jpg",
    mutualFriendCount: 3,
  },
  {
    id: "suggestion-8",
    name: "Kevin Wu",
    avatarUrl: "https://i.pinimg.com/1200x/db/60/62/db60629456caec781afd00b629f71230.jpg",
    mutualFriendCount: 9,
  },
  {
    id: "suggestion-9",
    name: "黃子豪",
    avatarUrl: "https://i.pinimg.com/1200x/3b/65/c3/3b65c374f5a0b43e7e1a54d172e3b633.jpg",
    followerCount: "856",
  },
  {
    id: "suggestion-10",
    name: "林怡君",
    avatarUrl: "https://i.pinimg.com/736x/67/46/a4/6746a4abfc5195e9a793e1cdadf51a6a.jpg",
    mutualFriendCount: 4,
  },
  {
    id: "suggestion-11",
    name: "Jason Wang",
    avatarUrl: "https://i.pinimg.com/736x/b0/14/0e/b0140e03ebee0fa1b842db6cda863d85.jpg",
    followerCount: "5,213",
  },
  {
    id: "suggestion-12",
    name: "蔡欣妤",
    avatarUrl: "https://i.pinimg.com/1200x/e1/50/0c/e1500c4778b2527108e66425feb05ba5.jpg",
    mutualFriendCount: 8,
  },
  {
    id: "suggestion-13",
    name: "Eric Liu",
    avatarUrl: "https://i.pinimg.com/1200x/64/59/6d/64596dacf46216326fdcb2cba0ae5dc1.jpg",
    followerCount: "3,445",
  },
  {
    id: "suggestion-14",
    name: "張雅筑",
    avatarUrl: "https://i.pinimg.com/736x/2b/59/b1/2b59b1354871cdf9bb68989eadef74f9.jpg",
    mutualFriendCount: 1,
  },
  {
    id: "suggestion-15",
    name: "Ryan Hsu",
    avatarUrl: "https://i.pinimg.com/1200x/b6/75/6f/b6756ff84f67dd83f9a3bb262588521c.jpg",
    followerCount: "6,108",
  },
  {
    id: "suggestion-16",
    name: "吳佩珊",
    avatarUrl: "https://i.pinimg.com/736x/75/bf/51/75bf5193f7f426401b7de81ae4332dd9.jpg",
    mutualFriendCount: 5,
  },
  {
    id: "suggestion-17",
    name: "Andy Ho",
    avatarUrl: "https://i.pinimg.com/1200x/fd/5d/1b/fd5d1b0f0e235781cbb7e97d7c76d3b5.jpg",
    followerCount: "1.1 萬",
  },
  {
    id: "suggestion-18",
    name: "鄭宇翔",
    avatarUrl: "https://i.pinimg.com/1200x/4f/17/1c/4f171c85d6a8e468e305d0b89b056149.jpg",
    mutualFriendCount: 7,
  },
  {
    id: "suggestion-19",
    name: "Claire Lin",
    avatarUrl: "https://i.pinimg.com/736x/8d/1d/cd/8d1dcdd6c29e457d0f51141a8a633050.jpg",
    followerCount: "2,950",
  },
  {
    id: "suggestion-20",
    name: "高子晴",
    avatarUrl: "https://i.pinimg.com/1200x/2d/10/ee/2d10eefe37e1ffb366f7917ea2890b7a.jpg",
    mutualFriendCount: 10,
  },
  {
    id: "suggestion-21",
    name: "Kevin Tsai",
    avatarUrl: "https://i.pinimg.com/1200x/5e/8b/02/5e8b028aef1bd026eda45b81c692b749.jpg",
    followerCount: "4,688",
  },
  {
    id: "suggestion-22",
    name: "許家豪",
    avatarUrl: "https://i.pinimg.com/736x/8e/c2/91/8ec29179f06b88385942b8ded901e9e9.jpg",
    mutualFriendCount: 2,
  },
  {
    id: "suggestion-23",
    name: "Amy Chen",
    avatarUrl: "https://i.pinimg.com/1200x/e0/ff/c1/e0ffc1bfcd2f8a0b7b7f181b6e430f71.jpg",
    followerCount: "987",
  },
  {
    id: "suggestion-24",
    name: "郭佳蓉",
    avatarUrl: "https://i.pinimg.com/736x/50/7c/b9/507cb911f1a066d118466b6314b5fd71.jpg",
    mutualFriendCount: 11,
  },
  {
    id: "suggestion-25",
    name: "Tony Huang",
    avatarUrl: "https://i.pinimg.com/736x/ca/7f/c9/ca7fc9fab1236e865866bcea3e55b647.jpg",
    followerCount: "8,203",
  },
  {
    id: "suggestion-26",
    name: "蘇品妤",
    avatarUrl: "https://i.pinimg.com/736x/88/de/64/88de64d21aeff67ff7fcd1ae12012081.jpg",
    mutualFriendCount: 6,
  },
  {
    id: "suggestion-27",
    name: "Daniel Wu",
    avatarUrl: "https://i.pinimg.com/736x/c5/40/31/c540315ab515edd8a2635a4702d25fbe.jpg",
    followerCount: "1.8 萬",
  },
  {
    id: "suggestion-28",
    name: "何佳穎",
    avatarUrl: "https://i.pinimg.com/736x/d7/6b/e4/d76be4b1b976f165e9e5b87340fe9eee.jpg",
    mutualFriendCount: 3,
  },
  {
    id: "suggestion-29",
    name: "Brian Chang",
    avatarUrl: "https://i.pinimg.com/736x/60/ca/b3/60cab31d45e8ac79a58b4d9b32e08064.jpg",
    followerCount: "7,550",
  },
  {
    id: "suggestion-30",
    name: "曾郁婷",
    avatarUrl: "https://i.pinimg.com/1200x/29/71/e9/2971e91aed6b9a68e1b3882b0d1ba82b.jpg",
    mutualFriendCount: 12,
  },
]
</script>

<template>
  <div class="space-y-4 pb-10">
    <FriendRequestsSection :friends="friendRequests" />

    <FriendSuggestionsSection :friends="friendSuggestions" />
  </div>
</template>
