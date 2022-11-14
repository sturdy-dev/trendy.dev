/// <reference types="./mailchimp.d.ts">
import mailchimp from '@mailchimp/mailchimp_marketing';
import { writeFileSync } from 'fs';
import yargs from 'yargs';

const argv = yargs(process.argv.slice(2))
	.option('output', {
		alias: 'o',
		type: 'string',
		description: 'file path to write results to',
		default: './src/lib/archive/archive.json',
		demandOption: true
	})
	.parseSync();

mailchimp.setConfig({
	apiKey: process.env.MAILCHIMP_KEY,
	server: 'us7'
});

const run = async () => {
	const response = await mailchimp.campaigns.list({
		folder_id: '0de5f94376' // Trendy Dev Weekly
	});

	return response.campaigns.map((c) => {
		return {
			url: c.long_archive_url,
			title: c.settings.subject_line
		};
	});
};

run().then((archive) => writeFileSync(argv.output, JSON.stringify(archive)));
