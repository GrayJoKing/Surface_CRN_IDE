import React from 'react';
import { FaTrash, FaPlus, FaArrowRight } from 'react-icons/fa';

import SurfaceCRN, {Transition_Rule} from 'surface_crn';

interface TransitionRulesProps {
	model : SurfaceCRN
	addRule : () => void
	deleteRule : (r : Transition_Rule) => void
}

export default class TransitionRulesComponent extends React.Component<TransitionRulesProps, {rules_list : Transition_Rule[]}> {

	constructor(props : TransitionRulesProps) {
		super(props);
		this.state = {rules_list : props.model.rules};
	}

	render() {
		// TODO: figure out better way of unique indexing

		return <div className="grid panel rules_panel">
			<h3 className="panel_header"> Transition Rules </h3>

			<div id="rule_container">
				{this.state.rules_list.map((r : Transition_Rule, i : number) => <RuleRowComponent key={r.toString() + i.toString()} rule={r} deleteRule={() => this.props.deleteRule(r)} />)}
				<div onClick={this.props.addRule}> Add Rule </div>
			</div>
		</div>;
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

		return <div className="rulesRow grid">
			<div> <input value={this.state.rate} type="number" className="rulesRate" onChange={this.updateRule.bind(this)} min="0" step="0.1"/> </div>
			<div> <input value={this.state.reactant0} className="rulesReactant0" onChange={this.updateRule.bind(this)}/> </div>
			<div> <FaPlus /> </div>
			<div> <input value={this.state.reactant1} className="rulesReactant1" onChange={this.updateRule.bind(this)}/> </div>
			<div> <FaArrowRight /> </div>
			<div> <input value={this.state.product0} className="rulesProduct0" onChange={this.updateRule.bind(this)}/> </div>
			<div> <FaPlus /> </div>
			<div> <input value={this.state.product1} className="rulesProduct1" onChange={this.updateRule.bind(this)}/> </div>
			<FaTrash onClick={this.deleteRule} />
		</div>;
	}

	updateRule(e : React.ChangeEvent<HTMLInputElement>) {
		let reactants = [this.state.reactant0, this.state.reactant1];
		let products = [this.state.product0, this.state.product1];
		let newVal : string = e.currentTarget.value;
		switch (e.target.className) {
			case "rulesReactant0":
				reactants[0] = newVal;
				try {
					this.rule.update({reactants : reactants.filter(a => a !== "")});
				} catch {
					// set to red
				}
				this.setState({reactant0 : newVal});
				break;
			case "rulesReactant1":
				reactants[1] = newVal;
				try {
					this.rule.update({reactants : reactants.filter(a => a !== "")});
				} catch {
					// set to red
				}
				this.setState({reactant1 : newVal});
				break;
			case "rulesProduct0":
				products[0] = newVal;
				try {
					this.rule.update({products : products.filter(a => a !== "")});
				} catch {
					// set to red
				}
				this.setState({product0 : newVal});
				break;
			case "rulesProduct1":
				products[1] = newVal;
				try {
					this.rule.update({products : products.filter(a => a !== "")});
				} catch {
					// set to red
				}
				this.setState({product1 : newVal});
				break;
			case "rulesRate":
				products[1] = newVal;
				this.rule.update({rate : +newVal});
				this.setState({rate : +newVal});
				break;
		}
	}
}
