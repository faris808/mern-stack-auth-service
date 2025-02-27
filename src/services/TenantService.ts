import { Brackets, Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
import { ITenant, TenantQueryParams } from "../types";

export class TenantService {
    constructor(private readonly tenantRepository: Repository<Tenant>) {}
    async create(tenantData: ITenant) {
        return await this.tenantRepository.save(tenantData);
    }

    async getTenantData(validatedQuery: TenantQueryParams) {
        const queryBuilder = this.tenantRepository.createQueryBuilder("tenant");

        if (validatedQuery.q) {
            const searchTerm = `%${validatedQuery.q}%`;
            queryBuilder.where(
                new Brackets((qb) => {
                    qb.where("tenant.name ILike :q", {
                        q: searchTerm,
                    }).orWhere("tenant.address ILike :q", { q: searchTerm });
                }),
            );
        }

        const result = await queryBuilder
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy("tenant.id", "DESC")
            .getManyAndCount();
        return result;
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
