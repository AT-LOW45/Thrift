import React from "react";
import { useOutletContext } from "react-router-dom";

const Overview = () => {
	const hey: { hello: string } = useOutletContext();

	return <div>Overview {hey.hello}</div>;
};

export default Overview;
