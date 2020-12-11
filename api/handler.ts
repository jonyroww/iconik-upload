import { IconikAPI } from "../services/iconik.service";
import { Handler } from "aws-lambda";
import { errorHandler } from "../helper/error-handler";

export const createAsset: Handler = async (event, context) => {
	try {
		const iconik = new IconikAPI();
		const asset = await iconik.createAsset(event.body.title);
		const format = await iconik.createFormat(asset.id);
		const fileSet = await iconik.createFileSet(
			asset.id,
			format.id,
			event.body.title
		);

		const file = await iconik.createFile(
			asset.id,
			fileSet.id,
			format.id,
			event.body.title,
			event.body.size
		);

		return file;
	} catch (e) {
		errorHandler(e);
	}
};

export const startTranscode: Handler = async (event, context) => {
	try {
		const iconik = new IconikAPI();
		return await iconik.startTranscodeJob(
			event.body.assetId,
			event.body.fileId
		);
	} catch (e) {
		errorHandler(e);
	}
};

export const getPresignedMultipartUrls: Handler = async (event, context) => {
	try {
		const iconik = new IconikAPI();
		return await iconik.getPresignedUrls(
			event.body.assetId,
			event.body.fileId,
			event.body.uploadId
		);
	} catch (e) {
		errorHandler(e);
	}
};
