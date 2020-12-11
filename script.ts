import * as fs from "fs";
import { deepListDir } from "deep-list-dir";
import axios, { AxiosRequestConfig } from "axios";
import FormData from "form-data";
import queue from "queue";
import { transform } from "camaro";

async function uploadIconik(path: string) {
	let q = queue();
	let results = 0;
	q.concurrency = 2;
	const filePathsList = await deepListDir(path);
	console.log(`Найдено файлов: ${filePathsList.length}`);

	for (let filePath of filePathsList) {
		let fileName: string = filePath.split("\\").pop();
		let fileSize: number = fs.statSync(filePath).size;

		q.push(async () => {
			const asset = await axios.post(
				"http://localhost:3000/dev/api/create-asset/",
				{ title: fileName, size: fileSize }
			);

			let formData = new FormData();
			formData.append("", fs.createReadStream(filePath));
			if (fileSize < 20971520) {
				let config: AxiosRequestConfig = {
					method: "put",
					url: asset.data.upload_url,
					headers: {
						...formData.getHeaders(),
					},
					data: formData["Body"],
				};

				await axios(config);
			} else {
				let multipartUploadResponse = await axios.post(
					asset.data.multipart_upload_url
				);

				const uploadId = await transform(multipartUploadResponse.data, {
					id: "//UploadId",
				});

				const multipartUrlsResponse = await axios.post(
					"http://localhost:3000/dev/api/get-multipart-urls",
					{
						assetId: asset.data.asset_id,
						fileId: asset.data.id,
						uploadId: uploadId.id,
					}
				);

				multipartUrlsResponse.data.map(async (url: string) => {
					let config: AxiosRequestConfig = {
						method: "put",
						url: url,
						headers: {
							...formData.getHeaders(),
						},
						data: formData["Body"],
					};

					await axios(config);
				});
			}
			await axios
				.post("http://localhost:3000/dev/api/transcode", {
					assetId: asset.data.asset_id,
					fileId: asset.data.id,
				})
				.then((result) => console.log("Запущена trascode job..."));
			results++;
		});
	}

	q.on("success", () => {
		console.log(`Файлов в очереди: ${q.length}`);
		console.log(`Файлов обработано: ${results}`);
	});
	q.on("error", (e) => {
		console.log(e);
		return;
	});
	q.on("end", () => console.log("Все файлы обработаны!"));

	q.start((err) => {
		console.log(err);
	});
}

uploadIconik("C:\\Users\\User\\Desktop\\folder");
