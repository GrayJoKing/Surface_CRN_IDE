import React from 'react';
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

import SurfaceCRN, {Transition_Rule} from 'surface_crn';
import Grid from "@mui/material/Grid";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import { TransitionGroup } from 'react-transition-group';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

interface TransitionRulesProps {
	model : SurfaceCRN
	rules : Transition_Rule[]
	addRule : () => void
	deleteRule : (r : Transition_Rule) => void
}

export default class TransitionRulesComponent extends React.Component<TransitionRulesProps, {}> {

	constructor(props : TransitionRulesProps) {
		super(props);
	}

	render() {
		// TODO: figure out better way of unique indexing

		return <Grid item xs={12} sm={8}>
			<Card>
				<CardHeader title="Transition Rules" />

				<Grid container item id="colour_container" sx={{"overflow-y" : "auto", "max-height" : "20rem"}}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Rate</TableCell>
								<TableCell align="center">Reactant</TableCell>
								<TableCell></TableCell>
								<TableCell align="center">Reactant</TableCell>
								<TableCell></TableCell>
								<TableCell align="center">Product</TableCell>
								<TableCell></TableCell>
								<TableCell align="center">Product</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{this.props.rules.map((r : Transition_Rule, i : number) => <RuleRowComponent key={r.toString() + i.toString()} rule={r} deleteRule={() => this.props.deleteRule(r)} />)}
						</TableBody>
					</Table>
				</Grid>

				<CardActions>
					<Button variant="outlined" onClick={this.props.addRule}> Add Rule </Button>
				</CardActions>
			</Card>

		</Grid>;
	}
}

interface RuleRowState {
	reactant0 : string,
	reactant1 : string,
	product0 : string,
	product1 : string,
	rate : number,
}
// TODO: Handle mono transitions properly (in here and in model)
class RuleRowComponent extends React.Component<{rule: Transition_Rule, deleteRule : React.MouseEventHandler<Element>}, RuleRowState> {
	rule : Transition_Rule;
	deleteRule : React.MouseEventHandler<Element>;

	constructor(props : {rule : Transition_Rule, deleteRule : React.MouseEventHandler<Element>}) {
		super(props);
		this.rule = props.rule;
		this.state = {
			reactant0 : props.rule.reactants[0],
			reactant1 : !props.rule.is_mono && props.rule.reactants.length > 1 ? props.rule.reactants[1] : '',
			product0 : props.rule.products[0],
			product1 : !props.rule.is_mono && props.rule.products.length > 1 ? props.rule.products[1] : '',
			rate : props.rule.rate,
		}
		this.deleteRule = props.deleteRule;
	}

	render() {
		// TODO: gray out mono'd rules
		// TODO: make invalid rules red

		return <TableRow >
			<TableCell> <TextField variant="filled" type="number" value={this.state.rate} onChange={this.updateRule.bind(this)} inputProps={{ inputMode: 'numeric', step : 0.1, pattern: '[0-9]+(\.[0-9]+)?', className : "rulesRate", min : 0, style: {"padding" : "5px"}}} /> </TableCell>
			<TableCell padding="none"> <TextField variant="filled" value={this.state.reactant0} onChange={this.updateRule.bind(this)} inputProps={{className:"rulesReactant0", style: {"padding" : "5px"}}}/> </TableCell>
			<TableCell padding="none" align="center"> <AddIcon /> </TableCell>
			<TableCell padding="none" align="center"> <TextField variant="filled" value={this.state.reactant1} className="rulesReactant1" onChange={this.updateRule.bind(this)} inputProps={{className:"rulesReactant1", style: {"padding" : "5px"}}}/> </TableCell>
			<TableCell padding="none" align="center"> <ArrowForwardIcon /> </TableCell>
			<TableCell padding="none" align="center"> <TextField variant="filled" value={this.state.product0} className="rulesProduct0" onChange={this.updateRule.bind(this)} inputProps={{className:"rulesProduct0", style: {"padding" : "5px"}}}/> </TableCell>
			<TableCell padding="none" align="center"> <AddIcon /> </TableCell>
			<TableCell padding="none" align="center"> <TextField variant="filled" value={this.state.product1} className="rulesProduct1" onChange={this.updateRule.bind(this)} inputProps={{className:"rulesProduct1", style: {"padding" : "5px"}}}/> </TableCell>
			<TableCell> <IconButton onClick={this.deleteRule}> <DeleteIcon/> </ IconButton> </TableCell>
		</TableRow>;
	}

	updateRule(e : React.ChangeEvent<HTMLInputElement>) {
		let reactants = [this.state.reactant0, this.state.reactant1];
		let products = [this.state.product0, this.state.product1];
		let newVal : string = e.currentTarget.value;
		if (e.target.classList.contains("rulesReactant0")) {
			reactants[0] = newVal;
			try {
				this.rule.update({reactants : reactants.filter(a => a !== "")});
			} catch {
				// set to red
			}
			this.setState({reactant0 : newVal});
		} else if (e.target.classList.contains("rulesReactant1")) {
			reactants[1] = newVal;
			try {
				this.rule.update({reactants : reactants.filter(a => a !== "")});
			} catch {
				// set to red
			}
			this.setState({reactant1 : newVal});
		} else if (e.target.classList.contains("rulesProduct0")) {
			products[0] = newVal;
			try {
				this.rule.update({products : products.filter(a => a !== "")});
			} catch {
				// set to red
			}
			this.setState({product0 : newVal});
		} else if (e.target.classList.contains("rulesProduct1")) {
			products[1] = newVal;
			try {
				this.rule.update({products : products.filter(a => a !== "")});
			} catch {
				// set to red
			}
			this.setState({product1 : newVal});
		} else if (e.target.classList.contains("rulesRate")) {
			products[1] = newVal;
			this.rule.update({rate : +newVal});
			this.setState({rate : +newVal});
		}
	}
}
