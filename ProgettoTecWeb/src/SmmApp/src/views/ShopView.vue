<script lang=ts>
import { addCharacters } from '@/services/user.service';

export default {

    data() {
        return {
            tiersUrl: {
                tier1: 'https://www.sandbox.paypal.com/instantcommerce/checkout/5LA33VB3DRZRJ',
                tier2: 'https://www.sandbox.paypal.com/instantcommerce/checkout/UZSK4BDQVMK2Q',
                tier3: 'https://www.sandbox.paypal.com/instantcommerce/checkout/APRL59BZBV7EC',
                tier4: 'https://www.sandbox.paypal.com/instantcommerce/checkout/9KV7B83QLVSQ2',
                dailytier1: 'https://www.sandbox.paypal.com/instantcommerce/checkout/VLK8VFRDYQ4MG',
                dailytier2: 'https://www.sandbox.paypal.com/instantcommerce/checkout/PFEBL2FXCPMTQ',
                dailytier3: 'https://www.sandbox.paypal.com/instantcommerce/checkout/NQY6TZ7Z9DKAW',
                dailytier4: 'https://www.sandbox.paypal.com/instantcommerce/checkout/ZUHFW8Y9YGTCW',
                weeklytier1: 'https://www.sandbox.paypal.com/instantcommerce/checkout/8C7G9FA4KQ49J',
                weeklytier2: 'https://www.sandbox.paypal.com/instantcommerce/checkout/YWUJZUDFD6L58',
                weeklytier3: 'https://www.sandbox.paypal.com/instantcommerce/checkout/Z88YVTHHYR4U6',
                weeklytier4: 'https://www.sandbox.paypal.com/instantcommerce/checkout/XYPNERHTEXDNJ',
                monthlytier1: 'https://www.sandbox.paypal.com/instantcommerce/checkout/NLYTA9FV3MM3N',
                monthlytier2: 'https://www.sandbox.paypal.com/instantcommerce/checkout/3SPB2YBKZ5YUL',
                monthlytier3: 'https://www.sandbox.paypal.com/instantcommerce/checkout/NY569L9Z8F468',
                monthlytier4: 'https://www.sandbox.paypal.com/instantcommerce/checkout/K9ARXPJPGEWYC',
            } as any,
            itemsBundle: [
                { id: 'tier1', icon: 'coin', name: 'Tier 1', price: this.prices.shop_tiers["tier1Price"], description: `${this.prices.shop_tiers.tier1.daily} daily, ${this.prices.shop_tiers.tier1.weekly} weekly, ${this.prices.shop_tiers.tier1.monthly} monthly` },
                { id: 'tier2', icon: 'cash', name: 'Tier 2', price: this.prices.shop_tiers["tier2Price"], description: `${this.prices.shop_tiers.tier2.daily} daily, ${this.prices.shop_tiers.tier2.weekly} weekly, ${this.prices.shop_tiers.tier2.monthly} monthly` },
                { id: 'tier3', icon: 'cash-coin', name: 'Tier 3', price: this.prices.shop_tiers["tier3Price"], description: `${this.prices.shop_tiers.tier3.daily} daily, ${this.prices.shop_tiers.tier3.weekly} weekly, ${this.prices.shop_tiers.tier3.monthly} monthly` },
                { id: 'tier4', icon: 'cash-stack', name: 'Tier 4', price: this.prices.shop_tiers["tier4Price"], description: `${this.prices.shop_tiers.tier4.daily} daily, ${this.prices.shop_tiers.tier4.weekly} weekly, ${this.prices.shop_tiers.tier4.monthly} monthly` }],
            itemsDaily: [
                { id: 'dailytier1', icon: 'coin', name: 'Daily Tier 1', price: this.prices.shop_tiers["tier1Price"], description: `${this.prices.shop_tiers.daily.tier1} char` },
                { id: 'dailytier2', icon: 'cash', name: 'Daily Tier 2', price: this.prices.shop_tiers["tier2Price"], description: `${this.prices.shop_tiers.daily.tier2} char` },
                { id: 'dailytier3', icon: 'cash-coin', name: 'Daily Tier 3', price: this.prices.shop_tiers["tier3Price"], description: `${this.prices.shop_tiers.daily.tier3} char` },
                { id: 'dailytier4', icon: 'cash-stack', name: 'Daily Tier 4', price: this.prices.shop_tiers["tier4Price"], description: `${this.prices.shop_tiers.daily.tier4} char` },],
            itemsWeekly: [
                { id: 'weeklytier1', icon: 'coin', name: 'Weekly Tier 1', price: this.prices.shop_tiers["tier1Price"], description: `${this.prices.shop_tiers.weekly.tier1} char` },
                { id: 'weeklytier2', icon: 'cash', name: 'Weekly Tier 2', price: this.prices.shop_tiers["tier2Price"], description: `${this.prices.shop_tiers.weekly.tier2} char` },
                { id: 'weeklytier3', icon: 'cash-coin', name: 'Weekly Tier 3', price: this.prices.shop_tiers["tier3Price"], description: `${this.prices.shop_tiers.weekly.tier3} char` },
                { id: 'weeklytier4', icon: 'cash-stack', name: 'Weekly Tier 4', price: this.prices.shop_tiers["tier4Price"], description: `${this.prices.shop_tiers.weekly.tier4} char` }],
            itemsMonthly: [
                { id: 'monthlytier1', icon: 'coin', name: 'Monthly Tier 1', price: this.prices.shop_tiers["tier1Price"], description: `${this.prices.shop_tiers.monthly.tier1} char` },
                { id: 'monthlytier2', icon: 'cash', name: 'Monthly Tier 2', price: this.prices.shop_tiers["tier2Price"], description: `${this.prices.shop_tiers.monthly.tier2} char` },
                { id: 'monthlytier3', icon: 'cash-coin', name: 'Monthly Tier 3', price: this.prices.shop_tiers["tier3Price"], description: `${this.prices.shop_tiers.monthly.tier3} char` },
                { id: 'monthlytier4', icon: 'cash-stack', name: 'Monthly Tier 4', price: this.prices.shop_tiers["tier4Price"], description: `${this.prices.shop_tiers.monthly.tier4} char` }
            ],
            bundlesNames: ['Only Daily', 'Only Weekly', 'Only Monthly'],
        }
    },
    methods: {
        async openShop(tier: string) {
            window.open(
                this.tiersUrl[tier],
                '_blank',
                'width=500,height=600'
            )

            await addCharacters(tier, this.vip.username).then((res) => {
                this.$emit('updateChars', tier);
            })

        },
    },
    props: {
        user: {
            type: Object,
            required: true
        },
        vip: {
            type: Object,
            required: true
        },
        prices: {
            type: Object,
            required: true
        },
    },
    emits: ['updateChars']
}
</script>

<template>
    <div class="container unselectable text-center col">
        <h1><i class="bi bi-shop"></i> Character store </h1>
        <div class="text-muted" v-if="!vip.username"><i class="bi bi-info-circle-fill"></i> Select a user to see the shop
        </div>
    </div>
    <div v-if="vip.username" class="content unselectable mx-4 mt-4" role="main">
        <div>
            <div class="row row-cols-1 row-cols-2 g-4">
                <div v-for="(item, index) in itemsBundle" class="col ">
                    <div @click="openShop(item.id)" class="card border-light clickable bg-primary">
                        <img class="card-img-top">
                        <div class="card-body">
                            <h2 class="card-title ">{{ item.name }}</h2>
                            <h1 class="card-text"><i :class="'bi bi-' + item.icon"></i> ${{ item.price }} </h1>
                            {{ item.description }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="accordion accordion-flush mt-4" id="accordionQuota">
                <div class="accordion-item almost-black"
                    v-for="(accordion, index) in [itemsDaily, itemsWeekly, itemsMonthly]">
                    <h2 class="accordion-header ">
                        <button class="accordion-button collapsed accordion-button-color" type="button"
                            data-bs-toggle="collapse" :data-bs-target="'#collapse' + index" aria-expanded="false"
                            :aria-controls="'collapse' + index">
                            <h1>{{ bundlesNames[index] }}</h1>
                        </button>
                    </h2>
                    <div :id="'collapse' + index" class="accordion-collapse collapse" data-bs-parent="#accordionQuota">
                        <div class="accordion-body">
                            <div class="row row-cols-1 row-cols-2 g-4">
                                <div class="col" v-for=" item in accordion">
                                    <div class="card border-light clickable h-100 bg-primary" @click="openShop(item.id)">
                                        <div class="card-body">
                                            <h5 class="card-title">{{ item.name }}</h5>
                                            <p>${{ item.price }}</p>
                                            <hr class="m-1">
                                            <div class="card-text h3"><i :class="'h1 bi bi-' + item.icon"></i> {{
                                                item.description }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<style></style>