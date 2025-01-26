import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
import { ITenant } from "../types";

export class TenantService {
    constructor(private readonly tenantRepository: Repository<Tenant>) {}
    async create(tenantData: ITenant) {
        return await this.tenantRepository.save(tenantData);
    }

    async getTenantData() {
        return await this.tenantRepository.find();
    }

    async getTenantDataById(tenantid: number) {
        return await this.tenantRepository.findOne({
            where: {
                id: tenantid,
            },
        });
    }

    async updateTenantById(tenantid: number, tenantData: ITenant) {
        return await this.tenantRepository.update(tenantid, tenantData);
    }

    async deleteTenantById(tenantid: number) {
        return await this.tenantRepository.delete(tenantid);
    }
}
