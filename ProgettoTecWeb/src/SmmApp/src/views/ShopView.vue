<script lang=ts>
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
                { id: 'tier1', icon: 'coin', name: 'Tier 1', price: 2.99, description: '10 daily, 30 weekly, 100 monthly' },
                { id: 'tier2', icon: 'cash', name: 'Tier 2', price: 4.99, description: '30 daily, 90 weekly, 300 monthly' },
                { id: 'tier3', icon: 'cash-coin', name: 'Tier 3', price: 9.99, description: '70 daily, 2100 weekly, 300 monthly' },
                { id: 'tier4', icon: 'cash-stack', name: 'Tier 4', price: 24.99, description: '150 daily, 450 weekly, 1500 monthly' },],
            itemsDaily: [
                { id: 'dailytier1', icon: 'coin', name: 'Daily Tier 1', price: 2.99, description: '50 char' },
                { id: 'dailytier2', icon: 'cash', name: 'Daily Tier 2', price: 4.99, description: '150 char' },
                { id: 'dailytier3', icon: 'coin-coin', name: 'Daily Tier 3', price: 9.99, description: '350 char' },
                { id: 'dailytier4', icon: 'cash-stack', name: 'Daily Tier 4', price: 24.99, description: '750 char' },],
            itemsWeekly: [
                { id: 'weeklytier1', icon: 'coin', name: 'Weekly Tier 1', price: 2.99, description: '150 char' },
                { id: 'weeklytier2', icon: 'cash', name: 'Weekly Tier 2', price: 4.99, description: '450 char' },
                { id: 'weeklytier3', icon: 'coin-coin', name: 'Weekly Tier 3', price: 9.99, description: '1050 char' },
                { id: 'weeklytier4', icon: 'cash-stack', name: 'Weekly Tier 4', price: 24.99, description: '2250 char' },],
            itemsMonthly: [
                { id: 'monthlytier1', icon: 'coin', name: 'Monthly Tier 1', price: 2.99, description: '500 char' },
                { id: 'monthlytier2', icon: 'cash', name: 'Monthly Tier 2', price: 4.99, description: '1500 char' },
                { id: 'monthlytier3', icon: 'cash-coin', name: 'Monthly Tier 3', price: 9.99, description: '3500 char' },
                { id: 'monthlytier4', icon: 'cash-stack', name: 'Monthly Tier 4', price: 24.99, description: '7500 char' }
            ]


        }
    },
    methods: {
        openShop(tier: string) {
            //this.router.navigate([page]);
            window.open(
                this.tiersUrl[tier], //
                '_blank',
                'width=500,height=600'
            )
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
        }
    },
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
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed  bg-primary" type="button" data-bs-toggle="collapse"
                            data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                            <h1 class="text-light">ONLY DAILY</h1>
                        </button>
                    </h2>
                    <div id="collapseOne" class="accordion-collapse collapse " data-bs-parent="#accordionQuota">
                        <div class="accordion-body bg-primary">
                            <div class="row row-cols-1 row-cols-2 g-4 ">
                                <div v-for="item in itemsDaily" class="col ">
                                    <div @click="openShop(item.id)" class="card bg-primary  border-light  clickable">
                                        <img class="card-img-top">
                                        <div class="card-body">
                                            <h2 class="card-title ">{{ item.name }}</h2>
                                            <h1 class="card-text "><i :class="'bi bi-' + item.icon"></i> ${{ item.price
                                            }} </h1>
                                            {{ item.description }}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed  bg-primary" type="button" data-bs-toggle="collapse"
                            data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                            <h1 class="text-light">ONLY WEEKLY</h1>
                        </button>
                    </h2>
                    <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#accordionQuota">
                        <div class="accordion-body bg-primary">
                            <div class="row row-cols-1 row-cols-2 g-4">
                                <div v-for="item in itemsWeekly" class="col ">
                                    <div @click="openShop(item.id)" class="card  bg-primary border-light  clickable">
                                        <img class="card-img-top">
                                        <div class="card-body">
                                            <h2 class="card-title ">{{ item.name }}</h2>
                                            <h1 class="card-text "><i :class="'bi bi-' + item.icon"></i> ${{ item.price
                                            }} </h1>
                                            {{ item.description }}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed  bg-primary" type="button" data-bs-toggle="collapse"
                            data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                            <h1 class="text-light">ONLY MONTHLY</h1>
                        </button>
                    </h2>
                    <div id="collapseThree" class="accordion-collapse collapse" data-bs-parent="#accordionQuota">
                        <div class="accordion-body bg-primary">
                            <div class="row row-cols-1 row-cols-2 g-4">
                                <div @click="openShop(item.id)" v-for="item in itemsDaily" class="col ">
                                    <div class="card  border-light  bg-primary clickable">
                                        <img class="card-img-top">
                                        <div class="card-body">
                                            <h2 class="card-title ">{{ item.name }}</h2>
                                            <h1 class="card-text "><i :class="'bi bi-' + item.icon"></i> ${{ item.price
                                            }} </h1>
                                            {{ item.description }}
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