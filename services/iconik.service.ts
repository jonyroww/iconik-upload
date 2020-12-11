import { IconikService } from "@workflowwin/iconik-api";
import { AssetSchema } from "@workflowwin/iconik-api/dist/src/assets/assets-methods";
import {
	FileCreateSchema,
	FileSetResponseSchema,
	FormatSchema,
} from "@workflowwin/iconik-api/dist/src/files/files-methods";
require("dotenv").config();
import axios from "axios";

export class IconikAPI {
	public iconik = new IconikService({
		appId: process.env.ICONIK_APP_ID || "",
		authToken: process.env.ICONIK_TOKEN || "",
		userId: process.env.ICONIK_USER_ID || "",
		iconikUrl: "https://preview.iconik.cloud",
	});

	public async createAsset(title: string): Promise<AssetSchema> {
		const data = {
			analyze_status: "N/A",
			is_online: true,
			status: "ACTIVE",
			title: title,
			type: "ASSET",
		};
		return await this.iconik.assets.createAsset(data);
	}

	public async createFormat(assetId: string): Promise<FormatSchema> {
		return await this.iconik.files.createFormat(assetId, "ORIGINAL");
	}

	public async createFileSet(
		assetId: string,
		formatId: string,
		name: string
	): Promise<FileSetResponseSchema> {
		const data = {
			format_id: formatId,
			name: name,
			base_dir: "/",
			component_ids: [],
		};
		return await this.iconik.files.createFileSet(assetId, data);
	}

	public async createFile(
		assetId: string,
		fileSetId: string,
		formatId: string,
		name: string,
		size: number
	): Promise<FileCreateSchema> {
		const file = {
			directory_path: "",
			file_set_id: fileSetId,
			format_id: formatId,
			original_name: name,
			name: name,
			size: Number(size),
		};
		return await this.iconik.files.createFile(assetId, file);
	}

	public async startTranscodeJob(assetId: string, fileId: string) {
		await this.iconik.files.createTranscodeJob(assetId, fileId);
	}

	public async createProxy(assetId: string) {
		const proxyData = {
			asset_id: assetId,
			status: "OPEN",
			storage_id: "765287cc-d8af-11ea-bfc0-c22fdf8d0135",
		};
		return await this.iconik.files.createProxy(assetId, proxyData);
	}

	public async generateKeyframes(assetId: string, proxyId: string) {
		return await this.iconik.files.generateKeyframes(assetId, proxyId);
	}

	public async getPresignedUrls(
		assetId: string,
		fileId: string,
		uploadId: string
	) {
		return await this.iconik.files.getPresignedUrlsMultipart(
			assetId,
			fileId,
			5,
			uploadId
		);
	}
}
