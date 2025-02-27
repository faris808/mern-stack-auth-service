import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest, TenantQueryParams } from "../types";
import { Logger } from "winston";
import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";

export class TenantController {
    constructor(
        private readonly tenantService: TenantService,
        private readonly logger: Logger,
    ) {}
    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { name, address } = req.body;
        try {
            const tenant = await this.tenantService.create({ name, address });
            this.logger.info("tenant has been created", { id: tenant.id });
            res.status(201).json({ id: tenant.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async getTenantList(req: Request, res: Response, next: NextFunction) {
        const validatedQuery = matchedData(req, { onlyValidData: true });
        console.log("validated query of tenantlist is:-", validatedQuery);
        try {
            const [tenants, count] = await this.tenantService.getTenantData(
                validatedQuery as TenantQueryParams,
            );
            this.logger.info("tenant list has been successfully fetched");
            res.status(200).json({
                currenPage: validatedQuery.currenPage,
                perPage: validatedQuery.perPage,
                total: count,
                data: tenants,
            });
        } catch (error) {
            next(error);
            return;
        }
    }

    async getTenantById(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.params.id;
            if (isNaN(Number(tenantId))) {
                next(createHttpError(400, "Invalid url params."));
                return;
            }
            const tenantdata = await this.tenantService.getTenantDataById(
                Number(tenantId),
            );
            if (!tenantdata) {
                next(createHttpError(400, "Tenant does not exist."));
                return;
            }
            this.logger.info("Tenant has been successfully fetched", {
                id: tenantId,
            });
            res.json(tenantdata);
        } catch (error) {
            next(error);
            return;
        }
    }

    async updateTenant(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const tenantId = req.params.id;
        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid url params."));
            return;
        }

        const { name, address } = req.body;
        try {
            await this.tenantService.updateTenantById(Number(tenantId), {
                name,
                address,
            });
            this.logger.info("Tenant has been successfully updated", {
                id: tenantId,
            });
            res.json({ id: Number(tenantId) });
        } catch (error) {
            next(error);
            return;
        }
    }

    async deleteTenant(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;
        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid url params."));
            return;
        }
        try {
            await this.tenantService.deleteTenantById(Number(tenantId));
            this.logger.info("tenant data has been successfully deleted", {
                id: tenantId,
            });
            res.json({ id: tenantId });
        } catch (error) {
            next(error);
            return;
        }
    }
}
