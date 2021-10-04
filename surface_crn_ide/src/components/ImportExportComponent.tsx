import React, { useRef } from 'react';

interface ImportProps {
	import_code : () => Promise<void>,
}

export class ImportExportComponent extends React.Component<ImportProps> {
	
	public constructor(props: ImportProps) {
		super(props);
	}
	
	
	render () {
		const { import_code } = this.props;
		return <div className="grid panel import_export_panel">
				<h3> Import/Export </h3>
				<div>
					<input type="file" id="import_input" multiple />
					<button type="submit" id="import_submit" onClick={import_code}> Import </button>
				</div>
			</div>;
	}
}

export default ImportExportComponent;