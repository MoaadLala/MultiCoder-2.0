import { motion } from 'framer-motion';

const animations = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: {opacity: 0},
}

export default function AnimatedDiv(props) {
    return (
        <motion.div
            variants={animations}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: .4 }}
        >
            {props.children}
        </motion.div>
    )
}