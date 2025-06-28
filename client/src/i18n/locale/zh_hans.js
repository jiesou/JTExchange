import Leaderboard from "@/views/Leaderboard.vue";
import { titleProps } from "ant-design-vue/es/typography/Title";

export default {
    success: '成功',
    refresh: '刷新',
    amount: '积分',
    comment: '备注',
    none: '暂无内容',
    transfer: '转账',
    app: {
        title: '拓学积分'
    },
    welcome: {
        title: '首页',
        intro: '拓学积分系统',
        introDesc: '一个行为，一分加减，一份公道',
        getStarted: '开始体验',
        registerNow: '立即注册',
        education: '校园互助',
        educationDesc: '拿水、借笔记、修设备，一切互帮互助都有积分',
        tooling: '积分交易',
        toolingDesc: '转给朋友或者在排行榜上炫耀！',
        ecosystem: '好事循环',
        ecosystemDesc: '实时积分流动，让更多同学参与互助',
        community: '公开动态',
        communityDesc: '发帖、投票，看看大家都在聊啥',
        support: '一起成长',
        supportDesc: '由同学共建，让善意传递不断，拉近师生家长距离',
    },
    login: {
        title: '登录',
        pk: '用户名',
        nick: '昵称',
        password: '密码',
    },
    register: {
        title: '注册',
    },
    dash: {
        title: '面板',
        loginPrompt: "尚未登录，请先登入来继续",
        welcome: '欢迎，{name}！',
        logout: '登出',
        deleteAccount: '删除账户',
        balance: '我的积分：{amount}',
        transferTo: '转给',
        transferSuccess: '转账成功',
        transferSuccessMessage: '已给 {to} 转 {amount} 分，备注：{comment}',
    },
    transaction: {
        title: '交易',
        innerid: 'ID',
        from: '来自',
        to: '到',
        amount: '数量',
        comment: '备注',
        list: '历史',
        summarize: '总结',
        summarizeDesc: '摘要在这里',
    },
    voice: {
        title: '语音转账',
        start: '开始',
        stop: '停止',
        understanding: '理解中...',
        content: '你的指令...',
        confirm: '确认',
    },
    post: {
        title: '帖子',
        list: '帖子列表',
        none: '暂无内容',
        new: '发帖',
        content: '内容',
        enableVote: '可投票',
        submit: '发布',
    },
    platform: {
        title: '平台',
    },
    leaderboard: {
        title: '排行榜'
    }
};
