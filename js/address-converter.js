// Address Converter - Chuyển đổi mã số thành tên địa danh
class AddressConverter {
    constructor() {
        this.provinces = null;
        this.districts = null;
        this.wards = null;
        this.init();
    }

    async init() {
        try {
            // Load dữ liệu địa danh từ file JSON
            const response = await fetch('js/provinces_full.json');
            const data = await response.json();
            
            // Cấu trúc JSON có dạng array của provinces, mỗi province có districts, mỗi district có wards
            this.provinces = data || [];
            
            // Tạo danh sách districts và wards từ provinces
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
            
            console.log('✅ Đã load dữ liệu địa danh thành công');
            console.log(`📊 Loaded: ${this.provinces.length} provinces, ${this.districts.length} districts, ${this.wards.length} wards`);
        } catch (error) {
            console.error('❌ Lỗi khi load dữ liệu địa danh:', error);
        }
    }

    // Chuyển đổi mã tỉnh/thành phố thành tên
    getProvinceName(provinceCode) {
        if (!this.provinces || !provinceCode) return provinceCode;
        
        const province = this.provinces.find(p => p.code === provinceCode || p.code === parseInt(provinceCode));
        return province ? province.name : provinceCode;
    }

    // Chuyển đổi mã quận/huyện thành tên
    getDistrictName(districtCode) {
        if (!this.districts || !districtCode) return districtCode;
        
        const district = this.districts.find(d => d.code === districtCode || d.code === parseInt(districtCode));
        return district ? district.name : districtCode;
    }

    // Chuyển đổi mã phường/xã thành tên
    getWardName(wardCode) {
        if (!this.wards || !wardCode) return wardCode;
        
        const ward = this.wards.find(w => w.code === wardCode || w.code === parseInt(wardCode));
        return ward ? ward.name : wardCode;
    }

    // Chuyển đổi toàn bộ địa chỉ
    convertAddress(addressData) {
        if (!addressData) return addressData;

        return {
            ...addressData,
            province: this.getProvinceName(addressData.province),
            district: this.getDistrictName(addressData.district),
            ward: this.getWardName(addressData.ward)
        };
    }

    // Chuyển đổi địa chỉ cho order data
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

    // Tạo địa chỉ đầy đủ
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

    // Kiểm tra dữ liệu đã load chưa
    isReady() {
        return this.provinces && this.districts && this.wards;
    }

    // Wait cho đến khi dữ liệu sẵn sàng
    async waitForReady() {
        while (!this.isReady()) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return true;
    }
}

// Tạo instance global
const addressConverter = new AddressConverter();
window.addressConverter = addressConverter;

// Export cho sử dụng từ các file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AddressConverter;
} 