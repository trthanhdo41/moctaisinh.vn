class AddressConverter {
    constructor() {
        this.provinces = null;
        this.districts = null;
        this.wards = null;
        this.init();
    }
    async init() {
        try {
            const response = await fetch('js/provinces_full.json');
            const data = await response.json();
            this.provinces = data || [];
            this.districts = [];
            this.wards = [];
            this.provinces.forEach(province => {
                if (province.districts) {
                    province.districts.forEach(district => {
                        this.districts.push({
                            ...district,
                            provinceCode: province.code
                        });
                        if (district.wards) {
                            district.wards.forEach(ward => {
                                this.wards.push({
                                    ...ward,
                                    districtCode: district.code,
                                    provinceCode: province.code
                                });
                            });
                        }
                    });
                }
            });
        } catch (error) {
        }
    }
    getProvinceName(provinceCode) {
        if (!this.provinces || !provinceCode) return provinceCode;
        const province = this.provinces.find(p => p.code === provinceCode || p.code === parseInt(provinceCode));
        return province ? province.name : provinceCode;
    }
    getDistrictName(districtCode) {
        if (!this.districts || !districtCode) return districtCode;
        const district = this.districts.find(d => d.code === districtCode || d.code === parseInt(districtCode));
        return district ? district.name : districtCode;
    }
    getWardName(wardCode) {
        if (!this.wards || !wardCode) return wardCode;
        const ward = this.wards.find(w => w.code === wardCode || w.code === parseInt(wardCode));
        return ward ? ward.name : wardCode;
    }
    convertAddress(addressData) {
        if (!addressData) return addressData;
        return {
            ...addressData,
            province: this.getProvinceName(addressData.province),
            district: this.getDistrictName(addressData.district),
            ward: this.getWardName(addressData.ward)
        };
    }
    convertOrderAddress(orderData) {
        if (!orderData || !orderData.customer) return orderData;
        const convertedCustomer = {
            ...orderData.customer,
            province: this.getProvinceName(orderData.customer.province),
            district: this.getDistrictName(orderData.customer.district),
            ward: this.getWardName(orderData.customer.ward)
        };
        return {
            ...orderData,
            customer: convertedCustomer
        };
    }
    getFullAddress(addressData) {
        if (!addressData) return '';
        const province = this.getProvinceName(addressData.province);
        const district = this.getDistrictName(addressData.district);
        const ward = this.getWardName(addressData.ward);
        const parts = [
            addressData.address,
            ward,
            district,
            province
        ].filter(part => part && part.trim());
        return parts.join(', ');
    }
    isReady() {
        return this.provinces && this.districts && this.wards;
    }
    async waitForReady() {
        while (!this.isReady()) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return true;
    }
}
const addressConverter = new AddressConverter();
window.addressConverter = addressConverter;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AddressConverter;
} 