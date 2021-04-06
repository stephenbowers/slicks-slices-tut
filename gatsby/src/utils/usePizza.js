import { useContext, useState } from "react";
import OrderContext from "../components/OrderContext";
import attachNamesAndPrices from "./attachNamesAndPrices";
import calculateOrderTotal from "./calculateOrderTotal";
import formatMoney from "./formatMoney";

export default function usePizza({ pizzas, values }) {
    // Create some state to hold the order
    // WE got rid of this line because we moved useState up to the provider
    // const [order, setOrder] = useState([]);
    // Now we access both our state and our updater function (setOrder) via context
    const [order, setOrder] = useContext(OrderContext);
    const [error, setError] = useState();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Make a function to add things to order
    function addToOrder(orderedPizza) {
        setOrder([...order, orderedPizza]);
    }
    // Make a runction to remove things from order
    function removeFromOrder(index) {
        setOrder([
            // Everything before the item we want to remove
            ...order.slice(0, index),
            // Everything after the item we want to remove
            ...order.slice(index + 1),
        ]);
    }

    // This is the function that is run when someone submits the form
    async function submitOrder(e) {
        e.preventDefault();
        console.log(e);
        setLoading(true);
        setError(null);
        //setMessage();
        // Gather all the data
        const body = {
            order: attachNamesAndPrices(order, pizzas),
            total: formatMoney(calculateOrderTotal(order, pizzas)),
            name: values.name,
            email: values.email,
            mapleSyrup: values.mapleSyrup,
        };
        // Send this data to a servless function when they check out
        const res = await fetch(
            `${process.env.GATSBY_SERVERLESS_BASE}/placeOrder`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
            }
        );
        const text = JSON.parse(await res.text());

        // Check if everything worked
        if(res.status >= 400 && res.status < 600) {
            setLoading(false); // Turn off loading
            setError(text.message);
        } else {
            // It worked
            setLoading(false);
            setMessage('Success!');
        }
    }
    

    return {
        order,
        addToOrder,
        removeFromOrder,
        error,
        loading,
        message,
        submitOrder,
    };
}